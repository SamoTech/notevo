// AES-GCM E2E encryption using Web Crypto API
// Password never leaves the browser

const PBKDF2_ITERATIONS = 100_000

export async function encryptNote(password: string, plaintext: string) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  )
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, enc.encode(plaintext)
  )
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  }
}

export async function decryptNote(password: string, ciphertext: string, ivB64: string, saltB64: string) {
  const dec = new TextDecoder()
  const enc = new TextEncoder()
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0))
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))

  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  )
  try {
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return { success: true, text: dec.decode(plainBuffer) }
  } catch {
    return { success: false, text: '' }
  }
}
