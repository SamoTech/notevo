'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Note } from '@/lib/types'

// ── CRYPTO (AES-GCM via Web Crypto API) ───────────────────
async function deriveKey(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  )
}
async function encryptText(plain: string, pass: string) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pass, salt)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, enc.encode(plain))
  const to64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf)))
  return { cipher: to64(cipher), iv: to64(iv), salt: to64(salt) }
}
async function decryptText(cipher64: string, pass: string, iv64: string, salt64: string): Promise<string> {
  const dec = new TextDecoder()
  const from64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
  const saltArr = from64(salt64)
  const ivArr = from64(iv64)
  const key = await deriveKey(pass, saltArr)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivArr.buffer as ArrayBuffer }, key, from64(cipher64))
  return dec.decode(plain)
}

// ── MARKDOWN ──────────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbulopqh]|<\/)(.+)$/gm, '<p>$1</p>')
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmtDate(ts: number): string {
  const d = new Date(ts), now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

type ViewMode = 'edit' | 'split' | 'preview'
type FilterMode = 'all' | 'encrypted' | 'plain'

interface LocalNote {
  id: string
  title: string
  body: string
  tags: string[]
  encrypted: boolean
  iv: string | null
  salt: string | null
  createdAt: number
  updatedAt: number
  dbId?: string
}

export default function Dashboard() {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [searchQ, setSearchQ] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [unlocked, setUnlocked] = useState<Record<string, string>>({})
  const [unlockPass, setUnlockPass] = useState('')
  const [unlockErr, setUnlockErr] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [encryptOpen, setEncryptOpen] = useState(false)
  const [epPass, setEpPass] = useState('')
  const [epConfirm, setEpConfirm] = useState('')
  const [epDecPass, setEpDecPass] = useState('')
  const [epErr, setEpErr] = useState('')
  const [epDecErr, setEpDecErr] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // suppress unused warning for sidebarOpen
  void sidebarOpen

  // ── THEME ──
  useEffect(() => {
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('notevo-theme') as 'light' | 'dark' | null
    const t = stored || (sysDark ? 'dark' : 'light')
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    setIsMobile(window.innerWidth <= 700)
    const onResize = () => setIsMobile(window.innerWidth <= 700)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('notevo-theme', next)
  }

  // ── LOAD NOTES FROM SUPABASE ──
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            const mapped: LocalNote[] = data.map((n: Note) => ({
              id: n.id,
              dbId: n.id,
              title: n.title,
              body: n.encrypted_body,
              tags: n.tags || [],
              encrypted: n.is_encrypted,
              iv: n.iv,
              salt: n.salt,
              createdAt: new Date(n.created_at).getTime(),
              updatedAt: new Date(n.updated_at).getTime(),
            }))
            setNotes(mapped)
          } else {
            setNotes(sampleNotes())
          }
          setLoading(false)
        })
    })
  }, [router])

  function sampleNotes(): LocalNote[] {
    return [
      {
        id: uid(), title: 'Welcome to Notevo 👋',
        body: '# Welcome to Notevo\n\nA **private**, encrypted note-taking app.\n\n## Features\n\n- ✅ Markdown editing with live preview\n- 🔐 AES-256 note encryption\n- 🏷️ Tags for organisation\n- 💾 Auto-save\n\nStart editing or press **+** to create a new one.',
        tags: ['welcome', 'demo'], encrypted: false, iv: null, salt: null,
        createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000
      },
      {
        id: uid(), title: 'Markdown cheatsheet',
        body: '# Markdown Cheatsheet\n\n**Bold**, *Italic*, `inline code`\n\n## Lists\n\n- Item one\n- Item two\n\n## Quote\n\n> The best way to predict the future is to invent it.',
        tags: ['reference'], encrypted: false, iv: null, salt: null,
        createdAt: Date.now() - 3600000, updatedAt: Date.now() - 600000
      }
    ]
  }

  // ── WORD COUNT ──
  useEffect(() => {
    setWordCount(body.trim() ? body.trim().split(/\s+/).length : 0)
    setCharCount(body.length)
  }, [body])

  // ── SELECT NOTE ──
  const selectNote = useCallback((id: string) => {
    setCurrentId(id)
    const note = notes.find(n => n.id === id)
    if (!note) return
    setTitle(note.title)
    setTags(note.tags)
    if (!note.encrypted) {
      setBody(note.body)
    } else if (unlocked[id] !== undefined) {
      setBody(unlocked[id])
    } else {
      setBody('')
    }
    setUnlockPass('')
    setUnlockErr('')
    if (isMobile) setMobileSidebarOpen(false)
  }, [notes, unlocked, isMobile])

  const currentNote = notes.find(n => n.id === currentId) || null
  const isLocked = !!currentNote?.encrypted && unlocked[currentId!] === undefined

  // ── AUTOSAVE ──
  const doSave = useCallback(async () => {
    if (!currentId || !currentNote) return
    const note = currentNote
    setSaveStatus('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const encrypted_body = body
    const iv = note.iv
    const salt = note.salt

    if (note.dbId) {
      await supabase.from('notes').update({
        title: title.trim() || 'Untitled',
        encrypted_body,
        iv, salt,
        tags,
        updated_at: new Date().toISOString()
      }).eq('id', note.dbId)
    }
    setNotes(prev => prev.map(n => n.id === currentId
      ? { ...n, title: title.trim() || 'Untitled', body: encrypted_body, tags, updatedAt: Date.now() }
      : n
    ))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [currentId, currentNote, title, body, tags])

  useEffect(() => {
    if (!currentId || isLocked) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    saveTimerRef.current = setTimeout(doSave, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [title, body, tags, currentId, isLocked, doSave])

  // ── CREATE NOTE ──
  const createNote = () => {
    const note: LocalNote = {
      id: uid(), title: '', body: '', tags: [],
      encrypted: false, iv: null, salt: null,
      createdAt: Date.now(), updatedAt: Date.now()
    }
    setNotes(prev => [note, ...prev])
    setCurrentId(note.id)
    setTitle('')
    setBody('')
    setTags([])
    setUnlockPass('')
    setUnlockErr('')
    setTimeout(() => document.getElementById('note-title-input')?.focus(), 50)
  }

  // ── DELETE ──
  const deleteNote = async () => {
    if (!currentId || !currentNote) return
    if (!confirm('Delete this note? This cannot be undone.')) return
    if (currentNote.dbId) {
      const supabase = createClient()
      await supabase.from('notes').delete().eq('id', currentNote.dbId)
    }
    setNotes(prev => prev.filter(n => n.id !== currentId))
    setCurrentId(null)
    setTitle('')
    setBody('')
    setTags([])
  }

  // ── UNLOCK ──
  const handleUnlock = async () => {
    if (!currentNote || !unlockPass) { setUnlockErr('Enter your password'); return }
    try {
      const plain = await decryptText(currentNote.body, unlockPass, currentNote.iv!, currentNote.salt!)
      setUnlocked(prev => ({ ...prev, [currentId!]: plain }))
      setBody(plain)
      setUnlockErr('')
    } catch {
      setUnlockErr('Incorrect password')
    }
  }

  // ── FORMAT TOOLBAR ──
  const fmt = (type: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    const sel = body.slice(s, e)
    let rep = '', cs = 0, ce = 0
    switch (type) {
      case 'bold':   rep = `**${sel || 'bold text'}**`; cs = 2; ce = rep.length - 2; break
      case 'italic': rep = `*${sel || 'italic text'}*`; cs = 1; ce = rep.length - 1; break
      case 'code':   rep = `\`${sel || 'code'}\``; cs = 1; ce = rep.length - 1; break
      case 'h1':     rep = `# ${sel || 'Heading 1'}`; cs = 2; ce = rep.length; break
      case 'h2':     rep = `## ${sel || 'Heading 2'}`; cs = 3; ce = rep.length; break
      case 'h3':     rep = `### ${sel || 'Heading 3'}`; cs = 4; ce = rep.length; break
      case 'ul':     rep = `- ${sel || 'List item'}`; cs = 2; ce = rep.length; break
      case 'ol':     rep = `1. ${sel || 'List item'}`; cs = 3; ce = rep.length; break
      case 'quote':  rep = `> ${sel || 'Quote'}`; cs = 2; ce = rep.length; break
      case 'link': {
        const url = prompt('URL:', 'https://'); if (!url) return
        rep = `[${sel || 'Link text'}](${url})`; cs = 1; ce = (sel || 'Link text').length + 1; break
      }
    }
    const newBody = body.slice(0, s) + rep + body.slice(e)
    setBody(newBody)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + cs, s + ce) }, 0)
  }

  // ── EXPORT ──
  const exportNote = () => {
    if (!currentNote) return
    const content = currentNote.encrypted
      ? (unlocked[currentId!] ?? '[Encrypted — unlock first]')
      : body
    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (title || 'note').replace(/[^a-z0-9]/gi, '_') + '.md'
    a.click()
  }

  // ── ENCRYPT PANEL ──
  const openEncryptPanel = () => {
    setEpPass(''); setEpConfirm(''); setEpDecPass(''); setEpErr(''); setEpDecErr('')
    setEncryptOpen(true)
  }

  const doEncryptAction = async () => {
    if (!currentNote) return
    if (currentNote.encrypted) {
      if (!epDecPass) { setEpDecErr('Enter password'); return }
      try {
        const plain = await decryptText(currentNote.body, epDecPass, currentNote.iv!, currentNote.salt!)
        setNotes(prev => prev.map(n => n.id === currentId
          ? { ...n, body: plain, encrypted: false, iv: null, salt: null }
          : n
        ))
        setUnlocked(prev => { const next = { ...prev }; delete next[currentId!]; return next })
        setBody(plain)
        setEncryptOpen(false)
      } catch { setEpDecErr('Incorrect password') }
    } else {
      if (!epPass) { setEpErr('Enter a password'); return }
      if (epPass !== epConfirm) { setEpErr('Passwords do not match'); return }
      if (epPass.length < 4) { setEpErr('Password must be at least 4 characters'); return }
      const { cipher, iv, salt } = await encryptText(body, epPass)
      setUnlocked(prev => ({ ...prev, [currentId!]: body }))
      setNotes(prev => prev.map(n => n.id === currentId
        ? { ...n, body: cipher, encrypted: true, iv, salt }
        : n
      ))
      setEncryptOpen(false)
    }
  }

  // ── FILTERED NOTES ──
  const filteredNotes = notes
    .filter(n => {
      if (filterMode === 'encrypted' && !n.encrypted) return false
      if (filterMode === 'plain' && n.encrypted) return false
      if (searchQ) {
        const q = searchQ.toLowerCase()
        const titleMatch = n.title.toLowerCase().includes(q)
        const bodyMatch = !n.encrypted && n.body.toLowerCase().includes(q)
        if (!titleMatch && !bodyMatch) return false
      }
      return true
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)

  // ── KEYBOARD SHORTCUTS ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEncryptOpen(false)
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') createNote()
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const showPreviewPane = viewMode === 'preview' || viewMode === 'split'
  const showEditorPane = viewMode === 'edit' || viewMode === 'split'

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        :root,[data-theme="light"]{
          --bg:#f7f6f2;--surface:#ffffff;--surface-2:#f3f2ef;
          --border:rgba(0,0,0,.09);--divider:rgba(0,0,0,.07);
          --text:#1a1917;--muted:#6b6a67;--faint:#b0afa9;
          --primary:#01696f;--primary-h:#0c4e54;--primary-hi:#cedcd8;
          --danger:#a12c7b;--warn-bg:#fff8ed;--warn-border:#f5c97a;
          --shadow-sm:0 1px 3px rgba(0,0,0,.07);
          --shadow-md:0 4px 16px rgba(0,0,0,.09);
          --shadow-lg:0 12px 40px rgba(0,0,0,.13);
          --r:8px;--r-lg:12px;--r-xl:16px;
          --font-body:'Inter',sans-serif;
          --font-display:'Instrument Serif',Georgia,serif;
          --sidebar-w:260px;--topbar-h:52px;
        }
        [data-theme="dark"]{
          --bg:#141312;--surface:#1c1b19;--surface-2:#232220;
          --border:rgba(255,255,255,.08);--divider:rgba(255,255,255,.06);
          --text:#d8d7d3;--muted:#7a7976;--faint:#4a4946;
          --primary:#4f98a3;--primary-h:#3a7f8a;--primary-hi:#1f3436;
          --danger:#d163a7;--warn-bg:#2a2318;--warn-border:#7a5820;
          --shadow-sm:0 1px 3px rgba(0,0,0,.3);
          --shadow-md:0 4px 16px rgba(0,0,0,.4);
          --shadow-lg:0 12px 40px rgba(0,0,0,.5);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden;-webkit-font-smoothing:antialiased}
        body{font-family:var(--font-body);background:var(--bg);color:var(--text)}
        button{cursor:pointer;background:none;border:none;font:inherit;color:inherit}
        input,textarea{font:inherit;color:inherit;background:none;border:none;outline:none}
        #notevo-root{display:flex;flex-direction:column;height:100vh;overflow:hidden}
        .icon-btn{width:34px;height:34px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:background .15s,color .15s;flex-shrink:0}
        .icon-btn:hover{background:var(--surface-2);color:var(--text)}
        .stab{font-size:12px;font-weight:500;padding:4px 10px;border-radius:99px;color:var(--muted);transition:background .15s,color .15s}
        .stab:hover{background:var(--surface-2);color:var(--text)}
        .stab.active{background:var(--primary-hi);color:var(--primary)}
        .note-item{padding:10px;border-radius:var(--r-lg);cursor:pointer;transition:background .12s;position:relative;margin-bottom:2px}
        .note-item:hover{background:var(--surface-2)}
        .note-item.active{background:var(--primary-hi)}
        .note-item.active .note-item-title{color:var(--primary)}
        .note-item-title{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
        .note-item-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}
        .note-item-excerpt{font-size:12px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fmt-btn{height:28px;padding:0 8px;border-radius:6px;font-size:12px;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:4px;transition:background .12s,color .12s;white-space:nowrap}
        .fmt-btn:hover{background:var(--surface-2);color:var(--text)}
        .vtab{height:26px;padding:0 10px;font-size:11px;font-weight:600;color:var(--muted);transition:background .12s,color .12s;white-space:nowrap}
        .vtab.active{background:var(--primary-hi);color:var(--primary)}
        .tag-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;background:var(--primary-hi);color:var(--primary)}
        .field label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:5px;letter-spacing:.03em;text-transform:uppercase}
        .field input{width:100%;height:38px;border:1px solid var(--border);border-radius:var(--r);padding:0 12px;font-size:14px;background:var(--surface-2);color:var(--text);transition:border-color .15s,box-shadow .15s}
        .field input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(1,105,111,.12);outline:none}
        .btn-cancel{flex:1;height:36px;border-radius:var(--r);border:1px solid var(--border);font-size:13px;font-weight:600;color:var(--muted);transition:background .15s}
        .btn-cancel:hover{background:var(--surface-2);color:var(--text)}
        .btn-primary-action{flex:2;height:36px;border-radius:var(--r);background:var(--primary);color:#fff;font-size:13px;font-weight:600;transition:background .15s}
        .btn-primary-action:hover{background:var(--primary-h)}
        .btn-danger-action{flex:2;height:36px;border-radius:var(--r);background:var(--danger);color:#fff;font-size:13px;font-weight:600;transition:opacity .15s}
        .btn-danger-action:hover{opacity:.85}
        #md-textarea::-webkit-scrollbar,#preview-pane::-webkit-scrollbar,#note-list-scroll::-webkit-scrollbar{width:4px}
        #md-textarea::-webkit-scrollbar-thumb,#preview-pane::-webkit-scrollbar-thumb,#note-list-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
        #preview-pane h1{font-family:var(--font-display);font-size:26px;font-weight:400;margin:0 0 16px;color:var(--text);line-height:1.2}
        #preview-pane h2{font-size:18px;font-weight:700;margin:24px 0 10px;color:var(--text)}
        #preview-pane h3{font-size:15px;font-weight:700;margin:18px 0 8px;color:var(--text)}
        #preview-pane p{margin:0 0 14px;line-height:1.7;font-size:14px;color:var(--text)}
        #preview-pane ul,#preview-pane ol{margin:0 0 14px;padding-left:20px}
        #preview-pane li{margin-bottom:4px;font-size:14px;line-height:1.6}
        #preview-pane code{font-family:monospace;font-size:13px;background:var(--surface-2);padding:2px 5px;border-radius:4px;color:var(--primary)}
        #preview-pane pre{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow-x:auto;margin:0 0 14px}
        #preview-pane pre code{background:none;padding:0;color:var(--text)}
        #preview-pane blockquote{border-left:3px solid var(--primary);padding:2px 0 2px 14px;margin:0 0 14px;color:var(--muted)}
        #preview-pane a{color:var(--primary);text-decoration:underline}
        #preview-pane hr{border:none;border-top:1px solid var(--border);margin:20px 0}
        #preview-pane img{max-width:100%;border-radius:var(--r)}
        #preview-pane table{width:100%;border-collapse:collapse;margin:0 0 14px;font-size:13px}
        #preview-pane th{background:var(--surface-2);font-weight:600;padding:8px 12px;border:1px solid var(--border);text-align:left}
        #preview-pane td{padding:7px 12px;border:1px solid var(--border)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:700px){
          #sidebar{position:fixed;inset:var(--topbar-h) 0 0 0;z-index:200;transform:translateX(-100%);transition:transform .2s;width:100%!important}
          #sidebar.mobile-open{transform:translateX(0)}
          #mobile-hamburger{display:flex!important}
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      <div id="notevo-root">

        {/* ── TOPBAR ── */}
        <header style={{ height: 'var(--topbar-h)', minHeight: 'var(--topbar-h)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', zIndex: 100, flexShrink: 0 }}>

          {/* mobile hamburger */}
          <button id="mobile-hamburger" className="icon-btn" style={{ display: 'none' }} onClick={() => setMobileSidebarOpen(v => !v)} title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>

          {/* logo */}
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-.3px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="19" cy="19" r="5" fill="var(--primary)" />
              <path d="M17 19l1.5 1.5L21 17" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Notevo
          </a>

          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          {currentId && (
            <>
              <button className="icon-btn" onClick={openEncryptPanel} title="Encrypt / decrypt note">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </button>
              <button className="icon-btn" onClick={exportNote} title="Export as Markdown">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </button>
              <button className="icon-btn" onClick={deleteNote} title="Delete note">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              </button>
            </>
          )}

          <div style={{ flex: 1 }} />

          <button className="icon-btn" onClick={toggleTheme} title="Toggle dark mode">
            {theme === 'dark'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            }
          </button>
        </header>

        {/* ── APP BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* ── SIDEBAR ── */}
          <aside id="sidebar" className={mobileSidebarOpen ? 'mobile-open' : ''}
            style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '0 10px', height: 32 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--faint)', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input id="search-input" type="search" placeholder="Search notes…" autoComplete="off" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ flex: 1, fontSize: 13, background: 'none', color: 'var(--text)' }} />
              </div>
              <button onClick={createNote} title="New note (N)"
                style={{ width: 32, height: 32, borderRadius: 'var(--r)', flexShrink: 0, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-h)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>

            <div style={{ display: 'flex', padding: '8px 12px 4px', gap: 4, flexShrink: 0 }}>
              {(['all', 'encrypted', 'plain'] as FilterMode[]).map(f => (
                <button key={f} className={`stab${filterMode === f ? ' active' : ''}`} onClick={() => setFilterMode(f)}>
                  {f === 'all' ? 'All' : f === 'encrypted' ? '🔐 Encrypted' : 'Plain'}
                </button>
              ))}
            </div>

            <div id="note-list-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '48px 16px', color: 'var(--faint)', textAlign: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .4 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <p style={{ fontSize: 13, lineHeight: 1.5 }}>No notes yet.<br />Press <strong>+</strong> to create one.</p>
                </div>
              ) : filteredNotes.map(n => (
                <div key={n.id} className={`note-item${n.id === currentId ? ' active' : ''}`} onClick={() => selectNote(n.id)}>
                  <div className="note-item-title">{escHtml(n.title) || 'Untitled'}</div>
                  <div className="note-item-meta">
                    {n.encrypted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)', opacity: .7 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </span>
                    )}
                    <span>{fmtDate(n.updatedAt)}</span>
                    {n.tags.length > 0 && <><span>·</span><span>{n.tags.slice(0, 2).map(t => '#' + t).join(' ')}</span></>}
                  </div>
                  <div className="note-item-excerpt">
                    {n.encrypted
                      ? <span style={{ color: 'var(--faint)', fontStyle: 'italic' }}>Encrypted content</span>
                      : escHtml(n.body.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\*/g, '').slice(0, 80))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── EDITOR AREA ── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {!currentId ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--faint)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: .25 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--muted)' }}>No note selected</h3>
                <p style={{ fontSize: 13, color: 'var(--faint)' }}>Select a note from the sidebar or create a new one</p>
                <button onClick={createNote}
                  style={{ marginTop: 8, padding: '9px 20px', borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-h)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
                >+ New note</button>
              </div>
            ) : (
              <>
                {/* EDITOR TITLE BAR */}
                <div style={{ height: 44, minHeight: 44, display: 'flex', alignItems: 'center', gap: 4, padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
                  <input id="note-title-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title…" autoComplete="off"
                    style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)', background: 'none', minWidth: 0 }} />
                  {currentNote?.encrypted && (
                    <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--primary-hi)', color: 'var(--primary)', flexShrink: 0 }}>
                      🔐 Encrypted
                    </span>
                  )}
                </div>

                {/* FORMAT TOOLBAR */}
                {!isLocked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px', borderBottom: '1px solid var(--divider)', background: 'var(--surface)', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button className="fmt-btn" onClick={() => fmt('bold')} title="Bold"><b>B</b></button>
                    <button className="fmt-btn" onClick={() => fmt('italic')} title="Italic"><i>I</i></button>
                    <button className="fmt-btn" onClick={() => fmt('code')} title="Inline code" style={{ fontFamily: 'monospace' }}>`C`</button>
                    <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />
                    <button className="fmt-btn" onClick={() => fmt('h1')}>H1</button>
                    <button className="fmt-btn" onClick={() => fmt('h2')}>H2</button>
                    <button className="fmt-btn" onClick={() => fmt('h3')}>H3</button>
                    <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />
                    <button className="fmt-btn" onClick={() => fmt('ul')}>• List</button>
                    <button className="fmt-btn" onClick={() => fmt('ol')}>1. List</button>
                    <button className="fmt-btn" onClick={() => fmt('quote')}>&quot; Quote</button>
                    <button className="fmt-btn" onClick={() => fmt('link')}>🔗 Link</button>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', flexShrink: 0 }}>
                      {(['edit', 'split', 'preview'] as ViewMode[]).map(m => (
                        <button key={m} className={`vtab${viewMode === m ? ' active' : ''}`} onClick={() => setViewMode(m)} style={{ textTransform: 'capitalize' }}>{m}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* UNLOCK OVERLAY */}
                {isLocked && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                    <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 99, background: 'var(--primary-hi)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, marginBottom: 6, color: 'var(--text)' }}>Note is encrypted</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Enter your password to read and edit this note</p>
                      <input type="password" value={unlockPass} onChange={e => { setUnlockPass(e.target.value); setUnlockErr('') }}
                        onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                        placeholder="Enter password…" autoComplete="current-password" autoFocus
                        style={{ width: '100%', height: 40, border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '0 14px', fontSize: 14, background: 'var(--surface-2)', color: 'var(--text)', marginBottom: 12, transition: 'border-color .15s, box-shadow .15s', outline: 'none' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(1,105,111,.12)' }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                      />
                      {unlockErr && <span style={{ display: 'block', fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{unlockErr}</span>}
                      <button onClick={handleUnlock}
                        style={{ width: '100%', height: 40, borderRadius: 'var(--r)', background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-h)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
                      >Unlock note</button>
                    </div>
                  </div>
                )}

                {/* EDITOR BODY */}
                {!isLocked && (
                  <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                    {showEditorPane && (
                      <textarea ref={textareaRef} id="md-textarea" value={body} onChange={e => setBody(e.target.value)}
                        placeholder={`Start writing in Markdown…\n\n# Your heading\n**Bold**, *italic*, \`code\`\n\n- List items\n- Like this`}
                        style={{ flex: 1, resize: 'none', padding: '24px 28px', fontFamily: "'Inter',monospace", fontSize: 14, lineHeight: 1.7, color: 'var(--text)', background: 'var(--bg)', border: 'none', outline: 'none', overflowY: 'auto', minWidth: 0 }}
                      />
                    )}
                    {viewMode === 'split' && <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />}
                    {showPreviewPane && (
                      <div id="preview-pane"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
                        style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', background: 'var(--surface)', borderLeft: '1px solid var(--border)', minWidth: 0 }}
                      />
                    )}
                  </div>
                )}

                {/* TAGS BAR */}
                {!isLocked && (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, padding: '7px 16px', borderTop: '1px solid var(--divider)', background: 'var(--surface)', flexShrink: 0, minHeight: 38 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--faint)', flexShrink: 0 }}>
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {tags.map(t => (
                      <span key={t} className="tag-chip">
                        {escHtml(t)}
                        <span onClick={() => setTags(prev => prev.filter(x => x !== t))}
                          style={{ opacity: .6, fontSize: 14, lineHeight: 1, cursor: 'pointer', padding: '0 1px' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '.6')}
                        >×</span>
                      </span>
                    ))}
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          const v = tagInput.trim().replace(/,/g, '')
                          if (v && !tags.includes(v)) setTags(prev => [...prev, v])
                          setTagInput('')
                        }
                      }}
                      placeholder="Add tag…"
                      style={{ fontSize: 12, color: 'var(--text)', width: 80, flexShrink: 0, background: 'none', border: 'none', outline: 'none' }}
                    />
                  </div>
                )}

                {/* STATUS BAR */}
                {!isLocked && (
                  <div style={{ height: 28, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                    <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{charCount} char{charCount !== 1 ? 's' : ''}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: saveStatus === 'saved' ? 'var(--primary)' : 'var(--faint)', transition: 'color .2s' }}>
                      {saveStatus === 'saved'
                        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Saved</>
                        : saveStatus === 'saving'
                        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /></svg> Saving…</>
                        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Saved</>
                      }
                    </span>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── ENCRYPT PANEL ── */}
      {encryptOpen && (
        <div onClick={e => e.target === e.currentTarget && setEncryptOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', padding: 28, width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, marginBottom: 4, color: 'var(--text)' }}>
              {currentNote?.encrypted ? 'Decrypt note' : 'Encrypt note'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              {currentNote?.encrypted ? 'Enter your password to permanently decrypt this note' : 'Protect this note with AES-256 encryption'}
            </p>

            {!currentNote?.encrypted && (
              <div style={{ background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 'var(--r)', padding: '10px 12px', marginBottom: 18, fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#e5a020', flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <span>This password <strong>cannot be recovered</strong>. If lost, the note cannot be decrypted. Store it safely.</span>
              </div>
            )}

            {!currentNote?.encrypted ? (
              <>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Password</label>
                  <input type="password" value={epPass} onChange={e => { setEpPass(e.target.value); setEpErr('') }} placeholder="Choose a strong password…" autoComplete="new-password" autoFocus
                    onKeyDown={e => e.key === 'Enter' && doEncryptAction()} />
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Confirm password</label>
                  <input type="password" value={epConfirm} onChange={e => { setEpConfirm(e.target.value); setEpErr('') }} placeholder="Confirm password…" autoComplete="new-password"
                    onKeyDown={e => e.key === 'Enter' && doEncryptAction()} />
                </div>
                {epErr && <span style={{ display: 'block', fontSize: 12, color: 'var(--danger)', marginBottom: 8 }}>{epErr}</span>}
              </>
            ) : (
              <>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Password</label>
                  <input type="password" value={epDecPass} onChange={e => { setEpDecPass(e.target.value); setEpDecErr('') }} placeholder="Enter your password…" autoComplete="current-password" autoFocus
                    onKeyDown={e => e.key === 'Enter' && doEncryptAction()} />
                </div>
                {epDecErr && <span style={{ display: 'block', fontSize: 12, color: 'var(--danger)', marginBottom: 8 }}>{epDecErr}</span>}
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="btn-cancel" onClick={() => setEncryptOpen(false)}>Cancel</button>
              <button className={currentNote?.encrypted ? 'btn-danger-action' : 'btn-primary-action'} onClick={doEncryptAction}>
                {currentNote?.encrypted ? 'Decrypt note' : 'Encrypt note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
