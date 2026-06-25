import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['/tests/e2e/', '/tests/md3/', '/tests/integration/'],
  moduleNameMapper: {
    // Source uses ESM-style `.js` extensions on relative imports (e.g.
    // `./profile-types.js`) which resolve to the `.ts` source at build time.
    // Jest can't strip the extension itself, so map it away here.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    // nanoid is ESM-only; redirect to CJS build so Jest can consume it
    '^nanoid$': '<rootDir>/../../node_modules/nanoid/index.cjs',
    // @metabuilder/components sub-paths use ESM-only exports; map to TS source files
    '^@metabuilder/components/m3$': '<rootDir>/../../node_modules/@metabuilder/components/m3/index.ts',
    '^@metabuilder/components/m3/(.*)$': '<rootDir>/../../node_modules/@metabuilder/components/m3/$1',
    '^@metabuilder/components$': '<rootDir>/../../node_modules/@metabuilder/components/index.tsx',
    '^@metabuilder/m3$': '<rootDir>/../../node_modules/@metabuilder/m3/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'json', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}

export default createJestConfig(config)
