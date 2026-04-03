import '@testing-library/jest-dom'

// Polyfill Web Crypto for jsdom (Node already has it, just wire it up)
import { webcrypto } from 'node:crypto'
if (!globalThis.crypto) {
  // @ts-expect-error – polyfill
  globalThis.crypto = webcrypto
}
