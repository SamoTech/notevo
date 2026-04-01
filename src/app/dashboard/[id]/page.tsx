'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient, type Note } from '@/lib/supabase'
import { decryptNote, encryptNote } from '@/lib/crypto'
import Link from 'next/link'

export default function NoteView() {
  const [note, setNote] = useState<Note | null>(null)
  const [body, setBody] = useState('')
  const [decrypted, setDecrypted] = useState(false)
  const [password, setPassword] = useState('')
  const [decryptError, setDecryptError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notes').select('*').eq('id', id).single()
      if (!data) { router.push('/dashboard'); return }
      setNote(data)
      if (!data.is_encrypted) { setBody(data.encrypted_body); setDecrypted(true) }
    }
    load()
  }, [id])

  const handleDecrypt = async () => {
    if (!note) return
    try {
      const plain = await decryptNote(password, { ciphertext: note.encrypted_body, iv: note.iv, salt: note.salt })
      setBody(plain)
      setDecrypted(true)
      setDecryptError('')
    } catch {
      setDecryptError('Wrong password — try again.')
    }
  }

  const handleSave = async () => {
    if (!note) return
    setSaving(true)
    let encrypted_body = body, iv = note.iv, salt = note.salt
    if (note.is_encrypted && password) {
      const enc = await encryptNote(password, body)
      encrypted_body = enc.ciphertext; iv = enc.iv; salt = enc.salt
    }
    await supabase.from('notes').update({ encrypted_body, iv, salt, title: note.title }).eq('id', note.id)
    setSaving(false)
    setEditing(false)
  }

  if (!note) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>

  return (
    <div className="min-h-screen" style={{background: 'var(--color-bg)'}}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-black/5 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
          <div className="flex gap-2">
            {decrypted && (
              <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
                className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">{note.title}</h1>
        <p className="text-xs text-gray-400 mb-6">
          {new Date(note.updated_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {note.is_encrypted && <span className="ml-2">🔐 Encrypted</span>}
        </p>

        {note.is_encrypted && !decrypted ? (
          <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm max-w-sm">
            <div className="text-3xl mb-4 text-center">🔒</div>
            <h3 className="text-lg font-medium text-center mb-4 text-gray-800">Enter password to unlock</h3>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDecrypt()}
              placeholder="Encryption password"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3" />
            {decryptError && <p className="text-xs text-red-500 mb-3">{decryptError}</p>}
            <button onClick={handleDecrypt} className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700">Unlock note</button>
          </div>
        ) : editing ? (
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={24}
            className="w-full bg-white rounded-2xl p-6 border border-black/5 text-sm text-gray-700 leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" />
        ) : (
          <div className="prose" dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br>') }} />
        )}
      </main>
    </div>
  )
}
