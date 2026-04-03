// AES-GCM E2E encryption using Web Crypto API
// Password never leaves the browser

// OWASP 2024 recommendation for PBKDF2 iterations
const PBKDF2_ITERATIONS = 600_000

// Helper: convert ArrayBuffer to base64 without spread (avoids TS2802)
function bufToB64(buf: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buf), b => String.fromCharCode(b)).join(''))
}

// Helper: ensure data buffer has a plain ArrayBuffer (not SharedArrayBuffer).
// Only use for plaintext/ciphertext data blobs — NOT for salt or iv,
// because Node.js WebCrypto rejects plain ArrayBuffer for those params.
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
}

export async function encryptNote(password: string, plaintext: string) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    // Pass Uint8Array directly — Node WebCrypto rejects ArrayBuffer here
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  const ciphertextBuffer = await crypto.subtle.encrypt(
    // Pass Uint8Array directly — Node WebCrypto rejects ArrayBuffer here
    { name: 'AES-GCM', iv },
    key,
    toArrayBuffer(enc.encode(plaintext))
  )
  return {
    ciphertext: bufToB64(ciphertextBuffer),
    iv: bufToB64(iv),
    salt: bufToB64(salt),
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
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    // Pass Uint8Array directly — Node WebCrypto rejects ArrayBuffer here
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  try {
    const plainBuffer = await crypto.subtle.decrypt(
      // Pass Uint8Array directly — Node WebCrypto rejects ArrayBuffer here
      { name: 'AES-GCM', iv },
      key,
      toArrayBuffer(data)
    )
    return { success: true, text: dec.decode(plainBuffer) }
  } catch {
    // Constant-time delay on failure to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 100))
    return { success: false, text: '' }
  }
}
