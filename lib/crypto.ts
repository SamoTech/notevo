export interface EncryptedPayload {
  ciphertext: string
  iv: string
  salt: string
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBuf(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
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
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
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
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
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
): Promise<string> {
  const salt = base64ToBuf(payload.salt)
  const key = await deriveKey(password, salt)
  const iv = base64ToBuf(payload.iv)
  const ciphertext = base64ToBuf(payload.ciphertext)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return new TextDecoder().decode(decrypted)
}

export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}
