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
      // A floor, not a target: it fails the run if coverage drops below what
      // has already been earned, so the number can only go up. Raise it as
      // each batch lands rather than setting an aspirational figure that is
      // red every day and therefore ignored.
      // Recalibrated down in phase 31 and again in phase 34: each time,
      // deleting a confirmed-dead, fully-tested subsystem removed a
      // covered slice of the denominator along with its numerator, so
      // the honest floor drops even though nothing real got less tested.
      // Raised in phase 40 after backfilling real tests for the newly
      // split retryable-error-boundary modules (measured 65.29/58.22/
      // 57.33/65.3; kept a small margin below that for run-to-run noise).
      // Raised again in phase 41 after splitting use-workflow-editor.ts
      // (measured 65.4/58.22/57.46/65.43). Raised again in phase 42 after
      // splitting api/dbal/schema/route.ts and backfilling approve/reject
      // tests (measured 65.67/58.47/57.58/65.71). Raised again in phase 43
      // after splitting use-package-registry.ts and backfilling publish
      // tests (measured 65.97/58.73/57.89/66). Raised again in phase 44
      // after splitting api/v1/[...slug]/route.ts and backfilling unit
      // tests for its extracted pure helpers (measured 66.12/58.9/58.03/
      // 66.12). Raised again in phase 46 after splitting style-controls.ts
      // and backfilling tests for its pure helpers (measured 66.16/58.93/
      // 58.03/66.15). Raised again in phase 47 after splitting workflow-
      // graph.ts and backfilling tests for its pure helpers (measured
      // 66.29/59.23/58.13/66.28). Raised again in phase 48 after splitting
      // AppBar.tsx (previously untested) and backfilling tests for its
      // hooks, pure helpers, and a rendering smoke test (measured
      // 66.75/60.04/58.69/66.76). Raised again in phase 49 after splitting
      // db-client.ts and backfilling tests for toEntityName/unwrap
      // (measured 66.8/60.07/58.88/66.81).
      thresholds: {
        statements: 66.7,
        branches: 60.0,
        functions: 58.8,
        lines: 66.7,
      },
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        // Type-only and generated files have nothing to execute.
        'src/**/*.d.ts',
        // Documentation that happens to compile. Nothing imports these and
        // nothing ships them; testing example code would be theatre, and
        // leaving them in the denominator makes the figure describe the
        // codebase less accurately, not more.
        'src/**/*.examples.{ts,tsx}',
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
      // The workflow editor lives outside src, like m3 -- without this the
      // general @/ rule below sends it to src/workflow-editor, which does not
      // exist, and its three consumers cannot be imported by a test at all.
      {
        find: /^@\/workflow-editor$/,
        replacement: resolve(
          __dirname,
          '../../libraries/components/workflow-editor'
        ),
      },
      // dbal-ui alias for shared UI components
      { find: /^@dbal-ui\/(.+)$/, replacement: resolve(__dirname, '../../dbal/shared/ui/$1') },
      { find: /^@dbal-ui$/, replacement: resolve(__dirname, '../../dbal/shared/ui') },
      // General @ alias last (least specific)
      { find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
})
