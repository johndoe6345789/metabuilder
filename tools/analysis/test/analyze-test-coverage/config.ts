export const COVERAGE_CONFIG = {
  srcPatterns: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'packages/**/src/**/*.ts',
    'packages/**/src/**/*.tsx',
    'dbal/development/**/*.ts'
  ],
  testPatterns: [
    'src/**/*.test.ts',
    'src/**/*.test.tsx',
    'packages/**/tests/**/*.test.ts',
    'packages/**/tests/**/*.test.tsx',
    'dbal/**/*.test.ts'
  ],
  ignorePatterns: ['**/node_modules/**', '**/.next/**', '**/build/**', '**/*.d.ts', '**/dist/**']
}
