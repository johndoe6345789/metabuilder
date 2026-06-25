import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*'],
      exclude: [
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/*.test.{js,ts,tsx}',
        'src/**/page.tsx',
        'src/**/layout.tsx',
        'src/**/route.ts',
        'src/app/**',
        'src/libs/**',
        'src/proxy.ts',
        'src/instrumentation*.ts',
        'src/**/*.json',
        'src/types/**',
        'src/models/**',
        'src/components/analytics/**',
        'src/components/examples/**',
        'src/config/sponsors.ts',
        'src/utils/auth.ts',
        'src/utils/db.ts',
        'src/utils/DBConnection.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{js,ts}'],
          exclude: ['src/hooks/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          include: ['**/*.test.tsx', 'src/hooks/**/*.test.ts'],
          exclude: [
            '**/node_modules/**',
            '**/BaseTemplate.test.tsx',
          ],
          environment: 'jsdom',
          setupFiles: [],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          include: ['**/*.test.tsx', 'src/hooks/**/*.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            screenshotDirectory: 'vitest-test-results',
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
    env: loadEnv('', process.cwd(), ''),
  },
});
