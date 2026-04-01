'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, type Note } from '@/lib/supabase'
import { decryptNote } from '@/lib/crypto'
import Link from 'next/link'

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })
      setNotes(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen" style={{background: 'var(--color-bg)'}}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-black/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#01696f"/>
              <path d="M7 8h14M7 13h10M7 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="21" cy="18" r="4" fill="#0f3638" stroke="white" strokeWidth="1.5"/>
              <path d="M21 16.5v1.5l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="font-serif text-lg">Notevo</span>
          </Link>
          <input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
            <Link href="/dashboard/new" className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              + New note
            </Link>
            <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Notes Grid */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-40 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3"/>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"/>
                <div className="h-3 bg-gray-100 rounded w-4/5"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-serif font-light text-gray-700 mb-2">
              {search ? 'No notes match your search' : 'No notes yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {search ? 'Try a different search term' : 'Create your first encrypted note'}
            </p>
            {!search && (
              <Link href="/dashboard/new" className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
                Create first note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(note => (
              <div key={note.id} className="group bg-white rounded-2xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative">
                <Link href={`/dashboard/${note.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-sm leading-snug flex-1 pr-2">{note.title || 'Untitled'}</h3>
                    {note.is_encrypted && <span className="text-xs">🔐</span>}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs p-1"
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
