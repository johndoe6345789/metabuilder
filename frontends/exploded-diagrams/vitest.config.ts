import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
        // Next.js App Router pages — require server context, not unit-testable
        'src/app/**',
        // React components that depend on Three.js/WebGL/next/image
        'src/components/PartMesh.tsx',
        'src/components/PartViewer3D.tsx',
        'src/components/ThreeCanvas.tsx',
        'src/components/DiagramRenderer.tsx',
        'src/components/Sidebar.tsx',
        'src/components/Tooltip.tsx',
        'src/components/AssemblyTabs.tsx',
        'src/components/AssemblyStatsPanel.tsx',
        'src/components/Breadcrumb.tsx',
        'src/components/Controls.tsx',
        'src/components/InstallationPanel.tsx',
        'src/components/InstallationSections.tsx',
        'src/components/PartSelector.tsx',
        // 3D geometry conversion — depends on jscad, not unit-testable without heavy mocking
        'src/lib/jscad-to-three.ts',
        // Data loader — requires file system / fetch at runtime
        'src/lib/loader.ts',
        // App config — re-exports env vars, no logic
        'src/lib/app-config.ts',
        // Assembly-level hooks that depend on fetch and Next.js router
        'src/app/**/hooks/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
})
