import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  // The engine modules import `server-only`, whose default export throws on import so
  // that bundling one into a client component fails the build. Tests run in node — they
  // are the server — so resolve it through the same `react-server` condition Next uses,
  // which the package maps to an empty module.
  ssr: {
    resolve: {
      conditions: ['react-server', 'node', 'import', 'module', 'default'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './') },
  },
})
