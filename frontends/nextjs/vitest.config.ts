import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      // Use inline to avoid duplicate React instances in tests
      optimizer: {
        web: {
          include: ['@/fakemui', 'react', 'react-dom']
        }
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // fakemui aliases must be first (more specific matches first)
      { find: /^@\/fakemui\/(.+)$/, replacement: resolve(__dirname, '../../fakemui/$1') },
      { find: /^@\/fakemui$/, replacement: resolve(__dirname, '../../fakemui/index.ts') },
      // dbal-ui alias for shared UI components
      { find: /^@dbal-ui\/(.+)$/, replacement: resolve(__dirname, '../../dbal/shared/ui/$1') },
      { find: /^@dbal-ui$/, replacement: resolve(__dirname, '../../dbal/shared/ui') },
      // General @ alias last (least specific)
      { find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
})
