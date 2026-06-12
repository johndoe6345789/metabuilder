import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules', '.next', 'dist', 'coverage',
      'src/styles/m3-scss/**', 'scripts/**',
      'public/**',
    ],
  },
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2024,
      sourceType: 'module',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    name: 'typescript/strict',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions'] }],
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/array-type': 'warn',
    },
  },
  {
    // Next.js dynamic-segment dirs ([id]/) have literal brackets in path names.
    // ESLint's glob expansion escapes them (\[id\]/), breaking TypeScript project
    // resolution. Override project:true with project:false for these files.
    // The pattern 'src/app/snippet/*/**' matches both the real and escaped paths.
    name: 'dynamic-segment-override',
    files: ['src/app/snippet/*/**'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false,
      },
    },
  },
  {
    name: 'react/modern',
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
  {
    name: 'next/core-web-vitals',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    name: 'react-hooks/recommended',
    files: ['**/*.{jsx,tsx}', '**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    name: 'project/custom-rules',
    rules: {
      '@next/next/no-page-custom-font': 'off',
      // Broken in @next/eslint-plugin-next when non-page .tsx files live
      // inside dynamic-segment directories (e.g. [id]/DebugPanel.tsx):
      // the plugin builds an invalid regex and crashes ESLint.
      // The rule is irrelevant for App Router projects anyway.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    name: 'project/80-80',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-len': [
        'error',
        {
          code: 80,
          ignoreUrls: true,
          ignoreTemplateLiterals: false,
          ignoreStrings: false,
          ignoreComments: false,
        },
      ],
      'max-lines': [
        'warn',
        { max: 80, skipBlankLines: false, skipComments: true },
      ],
    },
  },
  {
    name: 'config-files',
    files: ['*.config.js', '*.config.cjs', '*.config.mjs', 'next.config.js'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2024,
    },
  },
]
