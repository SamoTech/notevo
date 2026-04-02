'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { decryptNote } from '@/lib/crypto'
import type { Note, Notebook } from '@/lib/types'
import Link from 'next/link'

type FilterTab = 'all' | 'encrypted' | 'recent'

function Logo() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: 18, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '-0.2px' }}>
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
        <rect x="3" y="2" width="17" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="7" y="2" width="14" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="var(--color-bg)" />
        <path d="M10 9h8M10 13h8M10 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      Notevo
    </span>
  )
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [search, setSearch] = useState('')
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockPwd, setUnlockPwd] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [decrypted, setDecrypted] = useState<Record<string, string>>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // theme init
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

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUser({ email: session.user.email })
    const [{ data: notesData }, { data: nbData }] = await Promise.all([
      supabase.from('notes').select('*').order('updated_at', { ascending: false }),
      supabase.from('notebooks').select('*').order('created_at', { ascending: true })
    ])
    setNotes(notesData || [])
    setNotebooks(nbData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'n' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) router.push('/dashboard/new')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return
    const supabase = createClient()
    await supabase.from('notes').delete().eq('id', id)
    setNotes(n => n.filter(note => note.id !== id))
  }

  const handleUnlock = async (note: Note) => {
    const result = await decryptNote(unlockPwd, note.encrypted_body, note.iv, note.salt)
    if (result.success) {
      setDecrypted(d => ({ ...d, [note.id]: result.text }))
      setUnlocking(null); setUnlockPwd(''); setUnlockError('')
    } else {
      setUnlockError('Wrong password — try again')
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (decrypted[n.id]?.toLowerCase().includes(search.toLowerCase()))
    const matchNB = !selectedNotebook || n.notebook_id === selectedNotebook
    const matchTab = filterTab === 'all' ? true : filterTab === 'encrypted' ? n.is_encrypted : filterTab === 'recent' ? (Date.now() - new Date(n.updated_at).getTime() < 7 * 86400_000) : true
    return matchSearch && matchNB && matchTab
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 'var(--text-sm)' }}>Loading your notes...</span>
      </div>
    </div>
  )

  const SBR = { borderRadius: 'var(--radius-md)' } as const

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? 252 : 0, minWidth: sidebarOpen ? 252 : 0, flexShrink: 0,
        background: 'var(--color-surface)', borderRight: sidebarOpen ? '1px solid var(--color-border)' : 'none',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'width 0.2s, min-width 0.2s'
      }}>
        {/* sidebar top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 10px', height: 32 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ flex: 1, fontSize: 13, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)' }} />
            {search && <button onClick={() => setSearch('')} style={{ color: 'var(--color-text-faint)', fontSize: 14, lineHeight: 1 }}>×</button>}
          </div>
          <Link href="/dashboard/new" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0, fontSize: 20, lineHeight: 1 }} title="New note (N)">+</Link>
        </div>

        {/* filter tabs */}
        <div style={{ display: 'flex', padding: '8px 10px 4px', gap: 4, flexShrink: 0 }}>
          {(['all', 'encrypted', 'recent'] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setFilterTab(tab)} style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99, background: filterTab === tab ? 'var(--color-primary-hi)' : 'transparent', color: filterTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'background 0.15s, color 0.15s', textTransform: 'capitalize' }}>
              {tab === 'encrypted' ? '🔐' : tab === 'recent' ? '🕐' : '📓'} {tab}
            </button>
          ))}
        </div>

        {/* notebooks */}
        {notebooks.length > 0 && (
          <div style={{ padding: '4px 10px 0', flexShrink: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 6px 4px' }}>Notebooks</p>
            <button onClick={() => setSelectedNotebook(null)} style={{ width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 'var(--radius-md)', fontSize: 12, background: !selectedNotebook ? 'var(--color-primary-hi)' : 'transparent', color: !selectedNotebook ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>All notebooks</button>
            {notebooks.map(nb => (
              <button key={nb.id} onClick={() => setSelectedNotebook(nb.id)} style={{ width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 'var(--radius-md)', fontSize: 12, background: selectedNotebook === nb.id ? 'var(--color-primary-hi)' : 'transparent', color: selectedNotebook === nb.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>📁 {nb.title}</button>
            ))}
          </div>
        )}

        {/* note list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px 8px' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', color: 'var(--color-text-faint)', textAlign: 'center', gap: 8 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.4 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p style={{ fontSize: 12, lineHeight: 1.5 }}>{search ? 'No notes match your search' : 'No notes yet\nPress N to create one'}</p>
            </div>
          ) : filtered.map(note => (
            <Link key={note.id} href={`/dashboard/${note.id}`} style={{ display: 'block', padding: '9px 10px', borderRadius: 'var(--radius-lg)', marginBottom: 2, textDecoration: 'none', transition: 'background 0.12s', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{note.title || 'Untitled'}</span>
                {note.is_encrypted && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-primary)', flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 3 }}>{new Date(note.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {note.is_encrypted && !decrypted[note.id] ? '🔒 Encrypted' : (decrypted[note.id] || note.encrypted_body || '').slice(0, 80)}
              </div>
              {note.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
                  {note.tags.slice(0, 3).map(t => <span key={t} style={{ fontSize: '0.6rem', background: 'var(--color-primary-hi)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: 99 }}>#{t}</span>)}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* sidebar footer */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          <button onClick={handleLogout} style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-danger)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}>
            ↩ Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* topbar */}
        <div style={{ height: 50, minHeight: 50, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <Logo />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
          <button onClick={toggleTheme} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Toggle dark mode">
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <Link href="/dashboard/new" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: '#fff', padding: '6px 14px', borderRadius: 'var(--radius-lg)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
            title="New note (N)">
            + New note
          </Link>
        </div>

        {/* empty state when no note selected */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', gap: 12, padding: 32 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.3 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
          <p style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>Select a note from the sidebar<br />or press <kbd style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 6px', fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>N</kbd> to create one</p>
          <Link href="/dashboard/new" style={{ background: 'var(--color-primary)', color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius-lg)', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginTop: 8 }}>Create your first note</Link>
        </div>
      </div>
    </div>
  )
}
