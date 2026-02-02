import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'index.tsx',
    'vanilla/index': 'vanilla/index.ts',
    'vanilla/loading/index': 'vanilla/loading/index.tsx',
    'vanilla/error/index': 'vanilla/error/index.tsx',
    'vanilla/empty-state/index': 'vanilla/empty-state/index.tsx',
    'vanilla/skeleton/index': 'vanilla/skeleton/index.tsx',
    'vanilla/access-denied/index': 'vanilla/access-denied/index.tsx',
    'vanilla/notifications/index': 'vanilla/notifications/index.tsx',
    'vanilla/status-indicators/index': 'vanilla/status-indicators/index.tsx',
    'radix/dialogs/KeyboardShortcutsDialog': 'radix/dialogs/KeyboardShortcutsDialog.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
})
