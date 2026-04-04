import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEncryption } from '@/hooks/useEncryption'
import type { DecryptedNote } from '@/types/note'

function makeNote(overrides: Partial<DecryptedNote> = {}): DecryptedNote {
  return {
    id: 'note-1',
    user_id: 'user-1',
    title: 'Test Note',
    encrypted_body: 'Hello world',
    is_encrypted: false,
    pinned: false,
    iv: '',
    salt: '',
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    decryptedContent: undefined,
    isUnlocked: false,
    ...overrides,
  }
}

describe('useEncryption hook', () => {
  let saveFn: ReturnType<typeof vi.fn<[string, Partial<DecryptedNote>], Promise<void>>>

  beforeEach(() => {
    saveFn = vi.fn<[string, Partial<DecryptedNote>], Promise<void>>().mockResolvedValue(undefined)
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
    const note = makeNote({ encrypted_body: 'plain text' })
    const { result } = renderHook(() => useEncryption(note, saveFn))

    act(() => result.current.setShowEncryptDialog(true))

    await act(async () => {
      await result.current.encryptNote('my-password')
    })

    expect(saveFn).toHaveBeenCalledOnce()
    const [id, fields] = saveFn.mock.calls[0]
    expect(id).toBe('note-1')
    expect(fields.is_encrypted).toBe(true)
    // encrypted_body must be ciphertext (base64), not the original plaintext
    expect(fields.encrypted_body).not.toBe('plain text')
    expect(fields.iv).toBeTruthy()
    expect(fields.salt).toBeTruthy()
    expect(result.current.showEncryptDialog).toBe(false)
  }, 30_000)

  it('getDisplayContent returns raw body for unencrypted note', () => {
    const note = makeNote({ encrypted_body: 'visible' })
    const { result } = renderHook(() => useEncryption(note, saveFn))
    expect(result.current.getDisplayContent(note)).toBe('visible')
  })

  it('getDisplayContent returns null for locked encrypted note', () => {
    const note = makeNote({ is_encrypted: true, encrypted_body: 'ciphertext' })
    const { result } = renderHook(() => useEncryption(note, saveFn))
    expect(result.current.getDisplayContent(note)).toBeNull()
  })

  it('isUnlocked returns false for locked note', () => {
    const { result } = renderHook(() => useEncryption(makeNote(), saveFn))
    expect(result.current.isUnlocked('note-1')).toBe(false)
  })

  it('lockNote removes a previously unlocked note', async () => {
    const plaintext = 'secret content'
    const password = 'pw123'
    const { encryptNote: enc } = await import('@/lib/crypto')
    const { ciphertext, iv, salt } = await enc(password, plaintext)

    const note = makeNote({ is_encrypted: true, encrypted_body: ciphertext, iv, salt })
    const { result } = renderHook(() => useEncryption(note, saveFn))

    await act(async () => {
      await result.current.decryptNote(password)
    })
    expect(result.current.isUnlocked('note-1')).toBe(true)

    act(() => result.current.lockNote('note-1'))
    expect(result.current.isUnlocked('note-1')).toBe(false)
  }, 30_000)

  it('decryptNote sets unlockError on wrong password', async () => {
    const { encryptNote: enc } = await import('@/lib/crypto')
    const { ciphertext, iv, salt } = await enc('correct', 'text')
    const note = makeNote({ is_encrypted: true, encrypted_body: ciphertext, iv, salt })

    const { result } = renderHook(() => useEncryption(note, saveFn))
    await act(async () => {
      await result.current.decryptNote('wrong')
    })
    expect(result.current.unlockError).toMatch(/incorrect/i)
    expect(result.current.isUnlocked('note-1')).toBe(false)
  }, 30_000)
})
