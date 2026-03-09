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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    // nanoid is ESM-only; redirect to CJS build so Jest can consume it
    '^nanoid$': '<rootDir>/../../node_modules/nanoid/index.cjs',
    // @metabuilder/components sub-paths use ESM-only exports; map to TS source files
    '^@metabuilder/components/fakemui$': '<rootDir>/../../node_modules/@metabuilder/components/fakemui/index.ts',
    '^@metabuilder/components/fakemui/(.*)$': '<rootDir>/../../node_modules/@metabuilder/components/fakemui/$1',
    '^@metabuilder/components$': '<rootDir>/../../node_modules/@metabuilder/components/index.tsx',
    '^@metabuilder/fakemui$': '<rootDir>/../../node_modules/@metabuilder/fakemui/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

export default createJestConfig(config)
