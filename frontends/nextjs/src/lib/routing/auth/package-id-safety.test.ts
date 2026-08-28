import { describe, expect, it } from 'vitest'

import { validatePackageRoute } from './validate-package-route'

/**
 * The package id is used to build a filesystem path, so this is the guard
 * between a URL segment and reading arbitrary files. It is checked before any
 * file operation, and every rejection must come back as "Invalid package ID
 * format" rather than as a filesystem error that reveals what was probed.
 */
const rejected = (id: string) => {
  const result = validatePackageRoute(id, 'User')
  expect(result.allowed).toBe(false)
  expect(result.error).toBe('Invalid package ID format')
}

describe('package id traversal', () => {
  it.each(['../etc', '..', 'core/../secrets', 'a/../../b'])(
    'rejects %s for containing a parent reference',
    rejected
  )

  it.each(['a/b', 'core/sub', 'a\\b', '\\etc'])(
    'rejects %s for containing a separator',
    rejected
  )

  it('rejects an absolute path', () => {
    rejected('/etc/passwd')
  })
})

describe('package id shape', () => {
  it.each([
    '',
    'Core',
    '1core',
    '_core',
    'core-name',
    'core.name',
    'core name',
  ])('rejects %s as not matching the allowed shape', rejected)

  it('rejects a name longer than the limit', () => {
    rejected('a'.repeat(65))
  })

  it('accepts the shape it documents', () => {
    // Lowercase, starting with a letter, digits and underscores allowed.
    const result = validatePackageRoute('core_2', 'User')
    expect(result.error).not.toBe('Invalid package ID format')
  })

  it('accepts a name exactly at the length limit', () => {
    const result = validatePackageRoute('a'.repeat(64), 'User')
    expect(result.error).not.toBe('Invalid package ID format')
  })
})
