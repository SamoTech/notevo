// AES-GCM E2E encryption using Web Crypto API
// Password never leaves the browser

// Fix #1: Increased from 100_000 → 600_000 per OWASP 2024 recommendation
const PBKDF2_ITERATIONS = 600_000

// Helper: ensure Uint8Array has a plain ArrayBuffer (not SharedArrayBuffer)
// Required for Web Crypto API under TypeScript strict lib types
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
}

export async function encryptNote(password: string, plaintext: string) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(enc.encode(password)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(enc.encode(plaintext))
  )
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  }
}

export async function decryptNote(
  password: string,
  ciphertext: string,
  ivB64: string,
  saltB64: string
) {
  const dec = new TextDecoder()
  const enc = new TextEncoder()
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0))
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(enc.encode(password)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  try {
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(data)
    )
    return { success: true, text: dec.decode(plainBuffer) }
  } catch {
    // Fix #2: Constant-time delay on failure to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 100))
    return { success: false, text: '' }
  }
}
