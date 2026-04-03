/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'
import { webcrypto } from 'node:crypto'

// jsdom re-defines globalThis.crypto as a getter-only property during
// environment boot, which happens AFTER the setup file runs – meaning
// Object.defineProperty here gets overwritten before any test executes.
// vi.stubGlobal is applied by Vitest after the environment is ready,
// so it is the only reliable way to inject crypto.subtle into jsdom workers.
vi.stubGlobal('crypto', webcrypto)
