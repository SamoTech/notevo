import '@testing-library/jest-dom'

// jsdom provides a stub crypto object but omits crypto.subtle.
// Node.js 20 ships webcrypto; we always override globalThis.crypto so
// that Web Crypto API calls (AES-GCM, PBKDF2) work in every test.
import { webcrypto } from 'node:crypto'
// @ts-expect-error – polyfill: replace jsdom's incomplete stub with Node's full WebCrypto
globalThis.crypto = webcrypto
