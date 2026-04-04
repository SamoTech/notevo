/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'
import { webcrypto } from 'node:crypto'

// Polyfill crypto.subtle for jsdom. We patch both globalThis and window so
// that modules which reference either are covered. vi.stubGlobal is used so
// Vitest automatically restores the original value after each test file.
vi.stubGlobal('crypto', webcrypto)

// Belt-and-suspenders: also assign directly so static module closures that
// closed over `globalThis.crypto` before stubGlobal ran still get the value.
if (typeof window !== 'undefined' && !window.crypto?.subtle) {
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  })
}
