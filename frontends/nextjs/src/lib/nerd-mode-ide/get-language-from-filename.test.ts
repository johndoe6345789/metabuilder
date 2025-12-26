import { describe, expect, it } from 'vitest'
import { getLanguageFromFilename } from './get-language-from-filename'

describe('getLanguageFromFilename', () => {
  it.each([
    { name: 'script.ts', expected: 'typescript' },
    { name: 'view.tsx', expected: 'typescript' },
    { name: 'app.js', expected: 'javascript' },
    { name: 'styles.css', expected: 'css' },
    { name: 'script.lua', expected: 'lua' },
    { name: 'main.cpp', expected: 'cpp' },
    { name: 'README.md', expected: 'markdown' },
    { name: 'unknown.ext', expected: 'plaintext' },
  ])('returns $expected for $name', ({ name, expected }) => {
    expect(getLanguageFromFilename(name)).toBe(expected)
  })
})
