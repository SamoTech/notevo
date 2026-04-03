export interface EncryptedPayload {
  ciphertext: string
  iv: string
  salt: string
}

// OWASP 2024 recommendation for PBKDF2 iterations
const PBKDF2_ITERATIONS = 600_000

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
}

function base64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>
}

function toBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptNote(
  password: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(password, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBuffer(iv) },
    key,
    toBuffer(new TextEncoder().encode(plaintext))
  )
  return {
    ciphertext: bufToBase64(ciphertext),
    iv: bufToBase64(iv),
    salt: bufToBase64(salt),
  }
}

export async function decryptNote(
  password: string,
  payload: EncryptedPayload
): Promise<{ success: true; text: string } | { success: false; text: '' }> {
  const salt = base64ToBuf(payload.salt)
  const key = await deriveKey(password, salt)
  const iv = base64ToBuf(payload.iv)
  const ciphertext = base64ToBuf(payload.ciphertext)
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toBuffer(iv) },
      key,
      toBuffer(ciphertext)
    )
    return { success: true, text: new TextDecoder().decode(decrypted) }
  } catch {
    // Constant-time delay on failure to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 100))
    return { success: false, text: '' }
  }
}

export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}
