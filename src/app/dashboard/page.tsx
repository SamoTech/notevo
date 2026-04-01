'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { decryptNote } from '@/lib/crypto'
import type { Note, Notebook } from '@/lib/types'
import Link from 'next/link'

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [search, setSearch] = useState('')
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{email?: string} | null>(null)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockPwd, setUnlockPwd] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [decrypted, setDecrypted] = useState<Record<string, string>>({})
  const router = useRouter()

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
    return matchSearch && matchNB
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)'}}>
        <div style={{width: 32, height: 32, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite'}} />
        <span style={{fontSize: 'var(--text-sm)'}}>Loading your notes...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: 'var(--color-bg)'}}>
      {/* Sidebar */}
      <aside style={{width: 240, borderRight: '1px solid var(--color-divider)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--color-surface)', flexShrink: 0}}>
        <div className="flex items-center gap-2 mb-4 px-2">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" style={{color: 'var(--color-primary)'}}>
            <rect x="4" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600}}>Notevo</span>
        </div>

        <button onClick={() => setSelectedNotebook(null)}
          style={{textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, background: !selectedNotebook ? 'var(--color-primary)' : 'transparent', color: !selectedNotebook ? 'white' : 'var(--color-text-muted)'}}>
          📓 All notes ({notes.length})
        </button>

        {notebooks.map(nb => (
          <button key={nb.id} onClick={() => setSelectedNotebook(nb.id)}
            style={{textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', background: selectedNotebook === nb.id ? 'oklch(from var(--color-primary) l c h / 0.12)' : 'transparent', color: selectedNotebook === nb.id ? 'var(--color-primary)' : 'var(--color-text-muted)'}}>
            📁 {nb.title}
          </button>
        ))}

        <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-divider)'}}>
          <p style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '0.5rem', paddingLeft: '0.75rem'}}>{user?.email}</p>
          <button onClick={handleLogout} style={{width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)'}} className="hover:bg-red-50 hover:text-red-600 transition-colors">
            ↩ Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex: 1, overflow: 'auto'}}>
        {/* Topbar */}
        <div style={{position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-divider)', background: 'rgba(247,246,242,0.9)', backdropFilter: 'blur(8px)'}}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{flex: 1, padding: '0.5rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', fontSize: 'var(--text-sm)', outline: 'none'}} />
          <Link href="/dashboard/new"
            style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none'}}>
            + New note
          </Link>
        </div>

        {/* Notes grid */}
        <div style={{padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', alignContent: 'start'}}>
          {filtered.length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--color-text-muted)'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📝</div>
              <h3 style={{fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: '0.5rem'}}>No notes yet</h3>
              <p style={{fontSize: 'var(--text-sm)', marginBottom: '1.5rem'}}>Create your first encrypted note</p>
              <Link href="/dashboard/new" style={{display: 'inline-block', background: 'var(--color-primary)', color: 'white', padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none'}}>Create note</Link>
            </div>
          )}

          {filtered.map(note => (
            <div key={note.id} style={{background: 'var(--color-surface)', border: '1px solid oklch(from var(--color-text) l c h / 0.07)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative'}}>
              <div className="flex items-start justify-between gap-2">
                <h3 style={{fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4, fontFamily: 'var(--font-display)'}}>{note.title}</h3>
                {note.is_encrypted && <span style={{fontSize: '0.75rem', flexShrink: 0}}>🔐</span>}
              </div>

              {note.is_encrypted && !decrypted[note.id] ? (
                unlocking === note.id ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <input type="password" value={unlockPwd} onChange={e => { setUnlockPwd(e.target.value); setUnlockError('') }}
                      placeholder="Enter password"
                      onKeyDown={e => e.key === 'Enter' && handleUnlock(note)}
                      autoFocus
                      style={{padding: '0.375rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', outline: 'none'}} />
                    {unlockError && <p style={{fontSize: 'var(--text-xs)', color: '#dc2626'}}>{unlockError}</p>}
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleUnlock(note)} style={{flex: 1, padding: '0.375rem', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)'}}>Unlock</button>
                      <button onClick={() => { setUnlocking(null); setUnlockPwd(''); setUnlockError('') }} style={{padding: '0.375rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)'}}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setUnlocking(note.id); setUnlockError('') }}
                    style={{textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)'}}>
                    🔒 Click to unlock
                  </button>
                )
              ) : (
                <p style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {(decrypted[note.id] || note.encrypted_body).slice(0, 200)}
                </p>
              )}

              {note.tags?.length > 0 && (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.375rem'}}>
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{fontSize: '0.65rem', background: 'oklch(from var(--color-primary) l c h / 0.1)', color: 'var(--color-primary)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)'}}>#{tag}</span>
                  ))}
                </div>
              )}

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-divider)'}}>
                <span style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)'}}>{new Date(note.updated_at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}</span>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Link href={`/dashboard/${note.id}`} style={{fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none', padding: '0.25rem 0.75rem', border: '1px solid oklch(from var(--color-primary) l c h / 0.3)', borderRadius: 'var(--radius-full)'}}>Edit</Link>
                  <button onClick={() => handleDelete(note.id)} style={{fontSize: 'var(--text-xs)', color: '#dc2626', padding: '0.25rem 0.75rem', border: '1px solid #fecaca', borderRadius: 'var(--radius-full)'}}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
