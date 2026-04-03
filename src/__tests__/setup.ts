import '@testing-library/jest-dom'

// jsdom defines globalThis.crypto as a read-only getter, so a plain
// assignment throws "Cannot set property crypto … which has only a getter".
// We use Object.defineProperty to forcibly override it with Node's full
// WebCrypto implementation (which includes crypto.subtle).
import { webcrypto } from 'node:crypto'
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true,
})
