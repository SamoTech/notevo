'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { encryptNote, decryptNote } from '@/lib/crypto'
import type { Note } from '@/lib/types'
import Link from 'next/link'

type ViewMode = 'edit' | 'split' | 'preview'

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^---$/gm,'<hr>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\* (.+)$/gm,'<li>$1</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/^(?!<[hbulopq]|<\/)(.+)$/gm,'<p>$1</p>')
}

export default function EditNote() {
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const { id } = useParams() as { id: string }

  // theme
  useEffect(() => {
    const stored = localStorage.getItem('notevo-theme')
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const t = (stored || (sysDark ? 'dark' : 'light')) as 'light' | 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('notevo-theme', next)
  }

  useEffect(() => {
    setWordCount(body.trim() ? body.trim().split(/\s+/).length : 0)
    setCharCount(body.length)
  }, [body])

  const loadNote = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()
    if (error || !data) { router.push('/dashboard'); return }
    setNote(data)
    setTitle(data.title)
    setTags(data.tags || [])
    if (!data.is_encrypted) { setBody(data.encrypted_body); setUnlocked(true) }
    setLoading(false)
  }, [id, router])

  useEffect(() => { loadNote() }, [loadNote])

  // autosave
  const doSave = useCallback(async (currentTitle: string, currentBody: string, currentNote: Note | null, currentTags: string[]) => {
    if (!currentTitle.trim() || !currentNote || !unlocked) return
    const supabase = createClient()
    let encrypted_body = currentBody, iv = currentNote.iv, salt = currentNote.salt
    if (currentNote.is_encrypted && password) {
      const enc = await encryptNote(password, currentBody)
      encrypted_body = enc.ciphertext; iv = enc.iv; salt = enc.salt
    }
    await supabase.from('notes').update({ title: currentTitle.trim(), encrypted_body, iv, salt, tags: currentTags, updated_at: new Date().toISOString() }).eq('id', id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [id, password, unlocked])

  useEffect(() => {
    if (!unlocked || !note) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => doSave(title, body, note, tags), 800)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [title, body, tags, note, unlocked, doSave])

  const handleManualSave = async () => {
    if (!title.trim() || !note) return
    setSaving(true)
    await doSave(title, body, note, tags)
    setSaving(false)
  }

  const handleUnlock = async () => {
    if (!note) return
    const result = await decryptNote(password, note.encrypted_body, note.iv, note.salt)
    if (result.success) { setBody(result.text); setUnlocked(true); setUnlockError('') }
    else setUnlockError('Wrong password')
  }

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag])
    setTagInput('')
  }

  // format toolbar helpers
  const wrap = (before: string, after: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = body.slice(s, e)
    const newBody = body.slice(0, s) + before + selected + after + body.slice(e)
    setBody(newBody)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, e + before.length) }, 0)
  }
  const insertLine = (prefix: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const lineStart = body.lastIndexOf('\n', pos - 1) + 1
    const newBody = body.slice(0, lineStart) + prefix + body.slice(lineStart)
    setBody(newBody)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length) }, 0)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (note?.is_encrypted && !unlocked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.25rem' }}>{note.title}</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Enter your note password to unlock</p>
        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setUnlockError('') }}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          placeholder="Note password" autoFocus
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', fontSize: 'var(--text-sm)', outline: 'none', marginBottom: '0.75rem' }} />
        {unlockError && <p style={{ fontSize: 'var(--text-xs)', color: '#dc2626', marginBottom: '0.75rem' }}>{unlockError}</p>}
        <button onClick={handleUnlock} style={{ width: '100%', background: 'var(--color-primary)', color: 'white', padding: '0.625rem', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Unlock note</button>
        <Link href="/dashboard" style={{ display: 'block', marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>← Back to dashboard</Link>
      </div>
    </div>
  )

  const showEditor = viewMode === 'edit' || viewMode === 'split'
  const showPreview = viewMode === 'preview' || viewMode === 'split'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* TOPBAR */}
      <header style={{ height: 50, minHeight: 50, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Dashboard
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title"
            style={{ flex: 1, fontSize: 15, fontWeight: 600, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', minWidth: 0 }} />
          {note?.is_encrypted && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)', flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        </div>
        <button onClick={toggleTheme} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', transition: 'background 0.15s', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Toggle dark mode">
          {theme === 'dark'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <button onClick={handleManualSave} disabled={saving || !unlocked}
          style={{ background: saved ? '#16a34a' : 'var(--color-primary)', color: 'white', fontSize: 13, fontWeight: 500, padding: '6px 16px', borderRadius: 'var(--radius-lg)', opacity: (!unlocked) ? 0.5 : 1, transition: 'background 0.3s', flexShrink: 0, cursor: unlocked ? 'pointer' : 'not-allowed' }}>
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {/* FORMAT TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 12px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-surface)', flexShrink: 0, flexWrap: 'wrap' }}>
        {[
          { label: 'B', title: 'Bold', action: () => wrap('**', '**'), style: { fontWeight: 700 } },
          { label: 'I', title: 'Italic', action: () => wrap('*', '*'), style: { fontStyle: 'italic' } },
          { label: '`', title: 'Inline code', action: () => wrap('`', '`'), style: { fontFamily: 'monospace' } },
          null,
          { label: 'H1', title: 'Heading 1', action: () => insertLine('# '), style: {} },
          { label: 'H2', title: 'Heading 2', action: () => insertLine('## '), style: {} },
          { label: 'H3', title: 'Heading 3', action: () => insertLine('### '), style: {} },
          null,
          { label: '— ', title: 'Horizontal rule', action: () => setBody(b => b + '\n---\n'), style: {} },
          { label: '🔗', title: 'Link', action: () => wrap('[', '](url)'), style: {} },
        ].map((btn, i) =>
          btn === null
            ? <div key={i} style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 2px', flexShrink: 0 }} />
            : <button key={i} onClick={btn.action} title={btn.title}
                style={{ height: 27, padding: '0 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', background: 'transparent', transition: 'background 0.12s, color 0.12s', ...btn.style }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}>
                {btn.label}
              </button>
        )}
        <div style={{ flex: 1 }} />
        {/* view mode toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
          {(['edit', 'split', 'preview'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ height: 26, padding: '0 10px', fontSize: 11, fontWeight: 600, background: viewMode === mode ? 'var(--color-primary-hi)' : 'transparent', color: viewMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'background 0.12s, color 0.12s', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* TITLE + TAGS */}
      <div style={{ padding: '12px 28px 0', background: 'var(--color-bg)', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--color-divider)' }}>
          {tags.map(tag => (
            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', background: 'var(--color-primary-hi)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 99 }}>
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{ color: 'var(--color-primary)', opacity: 0.6, lineHeight: 1 }}>×</button>
            </span>
          ))}
          <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
            placeholder="+ add tag"
            style={{ fontSize: 'var(--text-xs)', background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', width: 80 }} />
        </div>
      </div>

      {/* EDITOR BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {showEditor && (
          <textarea ref={textareaRef} value={body} onChange={e => setBody(e.target.value)}
            placeholder="Write in Markdown..."
            style={{ flex: 1, resize: 'none', padding: '20px 28px', fontFamily: 'ui-monospace, monospace', fontSize: 14, lineHeight: 1.75, color: 'var(--color-text)', background: 'var(--color-bg)', border: 'none', outline: 'none', overflowY: 'auto', minWidth: 0 }}
            disabled={!unlocked}
          />
        )}
        {viewMode === 'split' && <div style={{ width: 1, background: 'var(--color-border)', flexShrink: 0 }} />}
        {showPreview && (
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            style={{ flex: 1, padding: '20px 28px', overflowY: 'auto', background: 'var(--color-surface)', minWidth: 0, borderLeft: viewMode === 'split' ? 'none' : '1px solid var(--color-border)' }}
          />
        )}
      </div>

      {/* FOOTER */}
      <div style={{ height: 28, minHeight: 28, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', borderTop: '1px solid var(--color-divider)', background: 'var(--color-surface)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{wordCount} words · {charCount} chars</span>
        {saved && <span style={{ fontSize: 11, color: '#16a34a' }}>✓ Autosaved</span>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>Ctrl+S to save</span>
      </div>
    </div>
  )
}
