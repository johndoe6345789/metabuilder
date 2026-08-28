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
      // `include` is what widens this beyond the files a test happens to
      // import; without it the number describes the tested corner rather
      // than the codebase. (Vitest 4 dropped the old `all` flag, which this
      // originally used -- it typechecked as an error while still working.)
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        // Type-only and generated files have nothing to execute.
        'src/**/*.d.ts',
      ],
    },
    deps: {
      // Use inline to avoid duplicate React instances in tests
      optimizer: {
        web: {
          include: ['react', 'react-dom']
        }
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // server-only throws on import outside a server component, so a server
      // module could not be unit tested at all without this.
      { find: /^server-only$/, replacement: resolve(__dirname, './src/test/server-only-stub.ts') },
      // m3 aliases must be first (more specific matches first)
      { find: /^@\/m3\/(.+)$/, replacement: resolve(__dirname, '../../libraries/components/m3/$1') },
      { find: /^@\/m3$/, replacement: resolve(__dirname, '../../libraries/components/m3/index.ts') },
      // dbal-ui alias for shared UI components
      { find: /^@dbal-ui\/(.+)$/, replacement: resolve(__dirname, '../../dbal/shared/ui/$1') },
      { find: /^@dbal-ui$/, replacement: resolve(__dirname, '../../dbal/shared/ui') },
      // General @ alias last (least specific)
      { find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
})
