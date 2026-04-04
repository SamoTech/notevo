import { defineConfig } from 'vitest/config'
import path from 'path'
import { webcrypto } from 'node:crypto'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    environmentOptions: {
      jsdom: {
        // Inject Node's WebCrypto into the jsdom window before any module
        // is evaluated. vi.stubGlobal in setup.ts fires too late — static
        // imports have already captured the globalThis.crypto reference by
        // then, so crypto.subtle is undefined inside those modules.
        resources: 'usable',
      },
    },
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/hooks/**'],
      exclude: ['src/lib/supabase*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
