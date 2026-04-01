'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { encryptNote, isEncryptionSupported } from '@/lib/crypto'
import Link from 'next/link'

export default function NewNote() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [password, setPassword] = useState('')
  const [useEncryption, setUseEncryption] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const router = useRouter()

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '')
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setTagInput('')
  }

  const handleSave = async () => {
    if (!title.trim()) { alert('Add a title'); return }
    if (useEncryption && !password) { alert('Enter encryption password'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    let encrypted_body = body, iv = '', salt = ''
    if (useEncryption && password) {
      const enc = await encryptNote(password, body)
      encrypted_body = enc.ciphertext
      iv = enc.iv
      salt = enc.salt
    }

    const { data, error } = await supabase.from('notes').insert({
      user_id: session.user.id,
      title: title.trim(),
      encrypted_body,
      iv,
      salt,
      tags,
      is_encrypted: useEncryption && !!password
    }).select().single()

    if (!error && data) router.push('/dashboard')
    else { alert(error?.message || 'Save failed'); setSaving(false) }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--color-bg)'}}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-black/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <span className="text-gray-200">|</span>
            <span className="text-sm text-gray-500">New note</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPreview(!preview)} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg">
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full text-3xl font-serif font-light bg-transparent border-none outline-none text-gray-900 placeholder-gray-300"
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-teal-400 hover:text-teal-700">×</button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ',') && addTag()}
            placeholder="Add tag..."
            className="text-xs bg-transparent border-none outline-none text-gray-500 placeholder-gray-300 w-24"
          />
        </div>

        <div className="border-t border-black/5 pt-4">
          {preview ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br>') }} />
          ) : (
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Start writing in Markdown..."
              rows={20}
              className="w-full bg-transparent border-none outline-none text-gray-700 text-sm leading-relaxed resize-none placeholder-gray-300 font-mono"
            />
          )}
        </div>

        {/* Encryption */}
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-lg border border-black/5 p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>🔐</span> Encrypt this note
            </label>
            <button
              onClick={() => setUseEncryption(!useEncryption)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                useEncryption ? 'bg-teal-500' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                useEncryption ? 'translate-x-5' : ''
              }`}/>
            </button>
          </div>
          {useEncryption && (
            <>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Encryption password"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-2">Remember this password — it cannot be recovered.</p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
