'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { encryptNote, decryptNote } from '@/lib/crypto'
import type { Note } from '@/lib/types'
import Link from 'next/link'

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
  const [preview, setPreview] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = useParams() as { id: string }

  useEffect(() => { setWordCount(body.trim() ? body.trim().split(/\s+/).length : 0) }, [body])

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

  const handleUnlock = async () => {
    if (!note) return
    const result = await decryptNote(password, note.encrypted_body, note.iv, note.salt)
    if (result.success) { setBody(result.text); setUnlocked(true); setUnlockError('') }
    else setUnlockError('Wrong password')
  }

  const handleSave = async () => {
    if (!title.trim() || !note) return
    setSaving(true)
    const supabase = createClient()
    let encrypted_body = body, iv = note.iv, salt = note.salt
    if (note.is_encrypted && password) {
      const enc = await encryptNote(password, body)
      encrypted_body = enc.ciphertext; iv = enc.iv; salt = enc.salt
    }
    const { error } = await supabase.from('notes').update({ title: title.trim(), encrypted_body, iv, salt, tags, updated_at: new Date().toISOString() }).eq('id', id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setTagInput('')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}><span style={{color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)'}}>Loading...</span></div>

  if (note?.is_encrypted && !unlocked) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--color-bg)'}}>
      <div style={{width: '100%', maxWidth: 360, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center'}}>
        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🔐</div>
        <h2 style={{fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.25rem'}}>{note.title}</h2>
        <p style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1.5rem'}}>Enter your note password to unlock</p>
        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setUnlockError('') }}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          placeholder="Note password" autoFocus
          style={{width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', fontSize: 'var(--text-sm)', outline: 'none', marginBottom: '0.75rem'}} />
        {unlockError && <p style={{fontSize: 'var(--text-xs)', color: '#dc2626', marginBottom: '0.75rem'}}>{unlockError}</p>}
        <button onClick={handleUnlock} style={{width: '100%', background: 'var(--color-primary)', color: 'white', padding: '0.625rem', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500}}>Unlock note</button>
        <Link href="/dashboard" style={{display: 'block', marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none'}}>← Back to dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--color-bg)'}}>
      <header style={{position: 'sticky', top: 0, zIndex: 10, background: 'rgba(247,246,242,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-divider)', padding: '0.75rem 1.5rem'}}>
        <div style={{maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Link href="/dashboard" style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none'}}>← Dashboard</Link>
            {note?.is_encrypted && <span style={{fontSize: '0.75rem'}}>🔐</span>}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)'}}>{wordCount} words</span>
            <button onClick={() => setPreview(!preview)} style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)'}}>
              {preview ? '✏️ Edit' : '👁 Preview'}
            </button>
            <button onClick={handleSave} disabled={saving || !unlocked}
              style={{background: saved ? '#16a34a' : 'var(--color-primary)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 500, padding: '0.375rem 1rem', borderRadius: 'var(--radius-lg)', opacity: (saving || !unlocked) ? 0.6 : 1, transition: 'background 0.3s'}}>
              {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <main style={{flex: 1, maxWidth: 720, margin: '0 auto', width: '100%', padding: '2rem 1.5rem'}}>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          style={{width: '100%', fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', marginBottom: '1rem'}} />

        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-divider)', marginBottom: '1.5rem'}}>
          {tags.map(tag => (
            <span key={tag} style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', background: 'oklch(from var(--color-primary) l c h / 0.1)', color: 'var(--color-primary)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)'}}>
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{color: 'var(--color-primary)', opacity: 0.6}}>×</button>
            </span>
          ))}
          <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
            placeholder="+ tag"
            style={{fontSize: 'var(--text-xs)', background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-muted)', width: 60}} />
        </div>

        {preview ? (
          <div className="prose" dangerouslySetInnerHTML={{
            __html: body.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/\n/g,'<br>')
          }} />
        ) : (
          <textarea value={body} onChange={e => setBody(e.target.value)}
            rows={32}
            style={{width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: 'var(--text-sm)', lineHeight: 1.8, resize: 'none', fontFamily: 'ui-monospace, monospace'}} />
        )}
      </main>
    </div>
  )
}
