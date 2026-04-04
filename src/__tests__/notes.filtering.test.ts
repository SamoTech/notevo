import { describe, it, expect } from 'vitest'
import type { DecryptedNote } from '@/types/note'

// ── helpers (mirror the logic from useNotes.ts) ───────────────────────────────
type NoteFilter = 'all' | 'encrypted' | 'plain'
type SortKey = 'updated' | 'created' | 'title'

function makeNote(overrides: Partial<DecryptedNote> = {}): DecryptedNote {
  return {
    id: Math.random().toString(36).slice(2),
    user_id: 'user-1',
    title: 'Untitled',
    encrypted_body: '',
    is_encrypted: false,
    pinned: false,
    iv: '',
    salt: '',
    tags: [],
    created_at: new Date(1_000_000).toISOString(),
    updated_at: new Date(1_000_000).toISOString(),
    decryptedContent: undefined,
    isUnlocked: false,
    ...overrides,
  }
}

function filterNotes(notes: DecryptedNote[], filter: NoteFilter, query: string) {
  return notes.filter(n => {
    if (filter === 'encrypted' && !n.is_encrypted) return false
    if (filter === 'plain' && n.is_encrypted) return false
    if (query) {
      const q = query.toLowerCase()
      // Never search ciphertext — only search body of plaintext notes.
      return (
        n.title.toLowerCase().includes(q) ||
        (!n.is_encrypted && n.encrypted_body.toLowerCase().includes(q))
      )
    }
    return true
  })
}

function sortNotes(notes: DecryptedNote[], sort: SortKey) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (sort === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    if (sort === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'title') return (a.title ?? '').localeCompare(b.title ?? '')
    return 0
  })
}

// ── filter tests ──────────────────────────────────────────────────────────────
describe('filterNotes', () => {
  const notes = [
    makeNote({ id: '1', title: 'Shopping List', is_encrypted: false, encrypted_body: 'milk, eggs' }),
    makeNote({ id: '2', title: 'Secret',        is_encrypted: true,  encrypted_body: '[ciphertext-base64]' }),
    makeNote({ id: '3', title: 'Work Notes',    is_encrypted: false, encrypted_body: 'standup at 9' }),
  ]

  it('returns all notes for filter=all', () => {
    expect(filterNotes(notes, 'all', '')).toHaveLength(3)
  })

  it('returns only encrypted notes', () => {
    const result = filterNotes(notes, 'encrypted', '')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns only plain notes', () => {
    const result = filterNotes(notes, 'plain', '')
    expect(result).toHaveLength(2)
    result.forEach(n => expect(n.is_encrypted).toBe(false))
  })

  it('filters by title search', () => {
    const result = filterNotes(notes, 'all', 'shopping')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by body content (plain notes only)', () => {
    const result = filterNotes(notes, 'all', 'standup')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('does not search encrypted note body', () => {
    // The encrypted note body contains [ciphertext-base64] but should never match.
    const result = filterNotes(notes, 'all', '[ciphertext-base64]')
    expect(result).toHaveLength(0)
  })

  it('returns empty array when no match', () => {
    expect(filterNotes(notes, 'all', 'xyzzy-no-match')).toHaveLength(0)
  })
})

// ── sort tests ────────────────────────────────────────────────────────────────
describe('sortNotes', () => {
  const now = Date.now()
  const notes = [
    makeNote({ id: 'a', title: 'Zebra', updated_at: new Date(now - 3000).toISOString(), created_at: new Date(now - 9000).toISOString() }),
    makeNote({ id: 'b', title: 'Apple', updated_at: new Date(now - 1000).toISOString(), created_at: new Date(now - 3000).toISOString() }),
    makeNote({ id: 'c', title: 'Mango', updated_at: new Date(now - 2000).toISOString(), created_at: new Date(now - 6000).toISOString() }),
  ]

  it('sorts by updated_at descending', () => {
    const sorted = sortNotes(notes, 'updated')
    expect(sorted.map(n => n.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by created_at descending', () => {
    const sorted = sortNotes(notes, 'created')
    expect(sorted.map(n => n.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by title alphabetically', () => {
    const sorted = sortNotes(notes, 'title')
    expect(sorted.map(n => n.title)).toEqual(['Apple', 'Mango', 'Zebra'])
  })

  it('pinned notes always come first regardless of sort', () => {
    const withPin = [
      makeNote({ id: 'x', title: 'A Normal', pinned: false, updated_at: new Date(now).toISOString() }),
      makeNote({ id: 'y', title: 'Z Pinned', pinned: true,  updated_at: new Date(now - 9999).toISOString() }),
    ]
    const sorted = sortNotes(withPin, 'updated')
    expect(sorted[0].id).toBe('y')
  })
})
