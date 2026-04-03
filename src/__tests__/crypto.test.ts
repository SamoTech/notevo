// @vitest-environment node
// crypto.test.ts has no DOM dependencies – run in Node so that
// crypto.subtle is available natively without any polyfill.
import { describe, it, expect } from 'vitest'
import { encryptNote, decryptNote } from '@/lib/crypto'

describe('encryptNote / decryptNote', () => {
  it('round-trips plaintext correctly', async () => {
    const plaintext = 'Hello, Notevo! 🔐'
    const password = 'super-secret-42'

    const { ciphertext, iv, salt } = await encryptNote(password, plaintext)

    expect(ciphertext).toBeTruthy()
    expect(iv).toBeTruthy()
    expect(salt).toBeTruthy()
    // ciphertext must not equal plaintext
    expect(ciphertext).not.toBe(plaintext)

    const result = await decryptNote(password, ciphertext, iv, salt)
    expect(result.success).toBe(true)
    expect(result.text).toBe(plaintext)
  })

  it('returns failure for wrong password', async () => {
    const { ciphertext, iv, salt } = await encryptNote('correct-password', 'secret')
    const result = await decryptNote('wrong-password', ciphertext, iv, salt)
    expect(result.success).toBe(false)
    expect(result.text).toBe('')
  })

  it('returns failure for tampered ciphertext', async () => {
    const { ciphertext, iv, salt } = await encryptNote('password', 'data')
    // Flip the last character to tamper the ciphertext
    const tampered = ciphertext.slice(0, -1) + (ciphertext.at(-1) === 'A' ? 'B' : 'A')
    const result = await decryptNote('password', tampered, iv, salt)
    expect(result.success).toBe(false)
  })

  it('produces different ciphertexts each call (random IV/salt)', async () => {
    const { ciphertext: c1 } = await encryptNote('pw', 'same text')
    const { ciphertext: c2 } = await encryptNote('pw', 'same text')
    expect(c1).not.toBe(c2)
  })

  it('handles empty string plaintext', async () => {
    const { ciphertext, iv, salt } = await encryptNote('pass', '')
    const result = await decryptNote('pass', ciphertext, iv, salt)
    expect(result.success).toBe(true)
    expect(result.text).toBe('')
  })

  it('handles unicode / emoji content', async () => {
    const text = '日本語テスト 🎉 مرحبا'
    const { ciphertext, iv, salt } = await encryptNote('pw', text)
    const result = await decryptNote('pw', ciphertext, iv, salt)
    expect(result.success).toBe(true)
    expect(result.text).toBe(text)
  })
})
