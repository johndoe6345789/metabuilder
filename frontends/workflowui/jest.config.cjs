const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // IMPORTANT: more-specific patterns must come BEFORE the generic '^@/(.*)$' catch-all.
    // Jest uses the FIRST matching pattern.

    // Mock @metabuilder/components (avoids ESM parse errors from deep transitive deps)
    '^@metabuilder/components$': '<rootDir>/__mocks__/componentsMock.tsx',
    '^@metabuilder/components/(.*)$': '<rootDir>/__mocks__/componentsMock.tsx',

    // Intercept @/../../../components/* (and similar) BEFORE the generic @/ catch-all
    '^@/(\\.\\./)+(components/.*)$': '<rootDir>/__mocks__/componentsMock.tsx',

    // Intercept @/../../../../../hooks/* (monorepo hooks with ESM deps)
    '^@/(\\.\\./)+(hooks/.*)$': '<rootDir>/__mocks__/componentsMock.tsx',

    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@metabuilder/m3$': '<rootDir>/__mocks__/m3Mock.tsx',
    '@/\\.\\./\\.\\./\\.\\./icons/react': '<rootDir>/__mocks__/iconsMock.tsx',
    '@/\\.\\./\\.\\./\\.\\./scss/(.*)$': 'identity-obj-proxy',
    // Fallback for icon mocks
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',
    // CSS modules
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // collectCoverage is false so that normal `jest` runs stay fast.
  // CI passes --coverage explicitly via the test:coverage script.
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageProvider: 'v8',
  coverageReporters: ['text', 'json', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@metabuilder)/)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
