import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

/**
 * MetaBuilder ESLint Configuration
 * 
 * Strict type-checking and code quality rules for the MetaBuilder platform.
 * Uses TypeScript ESLint for type-aware linting with progressive strictness.
 * 
 * **Philosophy:**
 * - Production code: Strict type safety to prevent bugs
 * - Stub/Integration code: Warnings to track technical debt without blocking development
 * - Dynamic systems: Relaxed rules for inherently dynamic JSON component rendering
 * - Test code: Flexibility for mocking patterns and test-specific assertions
 * 
 * **Rule Categories:**
 * 1. Base rules: TypeScript type-checking and code quality (ERRORS)
 * 2. Stub file relaxations: Placeholder implementations (WARNINGS)
 * 3. Dynamic renderer relaxations: JSON component system (WARNINGS)
 * 4. Test file relaxations: Test code patterns (WARNINGS)
 * 5. Type definition relaxations: Declaration files (WARNINGS)
 * 
 * **Key Strict Rules:**
 * - `strict-boolean-expressions`: Require explicit null/undefined checks
 * - `no-unsafe-*`: Prevent unsafe `any` type operations
 * - `require-await`: Ensure async functions actually await something
 * - `no-floating-promises`: Always handle promises properly
 * - `no-non-null-assertion`: Avoid dangerous ! assertions
 * 
 * **Maintenance:**
 * - Run `npm run lint` to check all files
 * - Run `npm run lint:fix` to auto-fix simple issues
 * - Use TODO comments in stub files until proper implementation
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'packages/*/dist', 'packages/*/node_modules', '.next/**', 'coverage/**', 'next-env.d.ts'] },
  
  // ============================================================================
  // Base Configuration - Strict Rules for Production Code
  // ============================================================================
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,
      
      // TypeScript Type Safety
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      
      // Strict Boolean Expressions - Require explicit comparisons
      '@typescript-eslint/strict-boolean-expressions': ['warn', {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: false,
      }],
      
      // Promise Handling
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'warn',
      
      // Type Assertions and Safety
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Unsafe Any Operations
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      
      // Code Style and Best Practices
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      
      // JavaScript Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-throw-literal': 'error',
    },
  },

  // ============================================================================
  // Test Files - Parser Configuration (no project type-checking)
  // ============================================================================
  // Test files are excluded from type-aware linting to avoid tsconfig conflicts
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        project: false,
        projectService: false,
      },
    },
  },

  // ============================================================================
  // Stub/Integration Files - Relaxed Rules (Warnings)
  // ============================================================================
  // These files are placeholders for future implementation
  // Warnings allow development to continue while tracking technical debt
  {
    files: [
      'src/lib/dbal/core/client/dbal-integration/**/*.ts',
      'src/lib/**/functions/**/*.ts',
      'src/hooks/**/*.ts',
      'src/lib/hooks/**/*.ts',
      'src/lib/github/**/*.ts',
      'src/lib/dbal-client/**/*.ts',
      'src/lib/dbal/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  
  // ============================================================================
  // Dynamic Component Renderers - Relaxed Rules
  // ============================================================================
  // JSON component system is inherently dynamic and requires some type flexibility
  {
    files: [
      'src/lib/packages/json/render-json-component.tsx',
      'src/components/ui-page-renderer/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  
  // ============================================================================
  // Test Files - Relaxed Rules
  // ============================================================================
  // Test files often need more flexibility for mocking and assertions
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  
  // ============================================================================
  // Type Definition Files - Relaxed Rules
  // ============================================================================
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
