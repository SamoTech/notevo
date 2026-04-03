import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEncryption } from '@/hooks/useEncryption'
import type { DecryptedNote } from '@/types/note'

function makeNote(overrides: Partial<DecryptedNote> = {}): DecryptedNote {
  return {
    id: 'note-1',
    user_id: 'user-1',
    title: 'Test Note',
    content: 'Hello world',
    is_encrypted: false,
    is_pinned: false,
    iv: null,
    salt: null,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('useEncryption hook', () => {
  let saveFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    saveFn = vi.fn().mockResolvedValue(undefined)
  })

  it('initialises with dialogs closed and no errors', () => {
    const { result } = renderHook(() => useEncryption(makeNote(), saveFn))
    expect(result.current.showEncryptDialog).toBe(false)
    expect(result.current.showUnlock).toBe(false)
    expect(result.current.unlockError).toBe('')
  })

  it('setShowEncryptDialog opens the dialog', () => {
    const { result } = renderHook(() => useEncryption(makeNote(), saveFn))
    act(() => result.current.setShowEncryptDialog(true))
    expect(result.current.showEncryptDialog).toBe(true)
  })

  it('encryptNote calls onSave with ciphertext and closes dialog', async () => {
    const note = makeNote({ content: 'plain text' })
    const { result } = renderHook(() => useEncryption(note, saveFn))

    act(() => result.current.setShowEncryptDialog(true))

    await act(async () => {
      await result.current.encryptNote('my-password')
    })

    expect(saveFn).toHaveBeenCalledOnce()
    const [id, fields] = saveFn.mock.calls[0]
    expect(id).toBe('note-1')
    expect(fields.is_encrypted).toBe(true)
    expect(fields.content).not.toBe('plain text') // must be ciphertext
    expect(fields.iv).toBeTruthy()
    expect(fields.salt).toBeTruthy()
    expect(result.current.showEncryptDialog).toBe(false)
  })

  it('getDisplayContent returns raw content for unencrypted note', () => {
    const note = makeNote({ content: 'visible' })
    const { result } = renderHook(() => useEncryption(note, saveFn))
    expect(result.current.getDisplayContent(note)).toBe('visible')
  })

  it('getDisplayContent returns null for locked encrypted note', () => {
    const note = makeNote({ is_encrypted: true, content: 'ciphertext' })
    const { result } = renderHook(() => useEncryption(note, saveFn))
    expect(result.current.getDisplayContent(note)).toBeNull()
  })

  it('isUnlocked returns false for locked note', () => {
    const { result } = renderHook(() => useEncryption(makeNote(), saveFn))
    expect(result.current.isUnlocked('note-1')).toBe(false)
  })

  it('lockNote removes a previously unlocked note', async () => {
    // Encrypt first, then decrypt to get it into unlocked map
    const plaintext = 'secret content'
    const password = 'pw123'
    const { encryptNote: enc, decryptNote: dec } = await import('@/lib/crypto')
    const { ciphertext, iv, salt } = await enc(password, plaintext)

    const note = makeNote({ is_encrypted: true, content: ciphertext, iv, salt })
    const { result } = renderHook(() => useEncryption(note, saveFn))

    // Decrypt to put into unlockedNotes
    await act(async () => {
      await result.current.decryptNote(password)
    })
    expect(result.current.isUnlocked('note-1')).toBe(true)

    // Lock it
    act(() => result.current.lockNote('note-1'))
    expect(result.current.isUnlocked('note-1')).toBe(false)
  })

  it('decryptNote sets unlockError on wrong password', async () => {
    const { encryptNote: enc } = await import('@/lib/crypto')
    const { ciphertext, iv, salt } = await enc('correct', 'text')
    const note = makeNote({ is_encrypted: true, content: ciphertext, iv, salt })

    const { result } = renderHook(() => useEncryption(note, saveFn))
    await act(async () => {
      await result.current.decryptNote('wrong')
    })
    expect(result.current.unlockError).toMatch(/incorrect/i)
    expect(result.current.isUnlocked('note-1')).toBe(false)
  })
})
