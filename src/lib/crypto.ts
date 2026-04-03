// AES-GCM E2E encryption using Web Crypto API
// Password never leaves the browser

// OWASP 2024 recommendation for PBKDF2 iterations
const PBKDF2_ITERATIONS = 600_000

// TypeScript's DOM lib types declare Pbkdf2Params.salt and AesGcmParams.iv
// as ArrayBuffer. Node.js WebCrypto (used by Vitest) rejects a plain
// ArrayBuffer produced by .buffer.slice() and requires a TypedArray.
// We pass the Uint8Array directly and cast to satisfy tsc without
// copying the buffer or changing the runtime value.
function asAB(u8: Uint8Array): ArrayBuffer {
  return u8 as unknown as ArrayBuffer
}

// Helper: convert ArrayBuffer/Uint8Array to base64 without spread (avoids TS2802)
function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
}

// Helper: ensure plaintext/ciphertext data has a plain ArrayBuffer backing.
// Only used for data blobs — NOT for salt or iv.
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
    { name: 'PBKDF2', salt: asAB(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: asAB(iv) },
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
    { name: 'PBKDF2', salt: asAB(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  try {
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: asAB(iv) },
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
