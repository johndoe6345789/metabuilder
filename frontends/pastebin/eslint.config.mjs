import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules', '.next', 'dist', 'coverage', 'src/styles/m3-scss/**', 'scripts/**'],
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
