import { describe, expect, it } from 'vitest'

import { pkg } from './test-support/package-fixtures'
import {
  areDependenciesMet,
  formatDependencies,
  getMissingDependencies,
  mergePackageUpdate,
  validatePackageData,
} from '@/lib/admin/package-utils'

describe('validatePackageData', () => {
  it('accepts a complete package', () => {
    expect(validatePackageData(pkg())).toEqual([])
  })

  it.each([
    ['id', 'Invalid package ID'],
    ['name', 'Invalid package name'],
    ['version', 'Invalid version'],
  ])('reports a missing %s', (field, message) => {
    const partial: Record<string, unknown> = { ...pkg() }
    delete partial[field]
    expect(validatePackageData(partial)).toContain(message)
  })

  // NaN is a number that is neither below zero nor above five, so it
  // validated cleanly and then rendered as "NaN" wherever it was shown.
  it.each([-1, 5.1, 100, NaN, Infinity])('rejects the rating %p', rating => {
    const errors = validatePackageData({ ...pkg(), rating })
    expect(errors).toContain('Invalid rating')
  })

  it.each([0, 2.5, 5])('accepts the rating %p', rating => {
    expect(validatePackageData({ ...pkg(), rating })).toEqual([])
  })

  it('rejects a rating that is not a number at all', () => {
    expect(validatePackageData({ ...pkg(), rating: '4' })).toContain(
      'Invalid rating'
    )
  })

  // Every problem at once, so a caller fixes them in one pass.
  it('reports every problem together', () => {
    expect(validatePackageData({})).toHaveLength(4)
  })
})

describe('mergePackageUpdate', () => {
  const a = pkg({ id: 'a', name: 'A' })
  const b = pkg({ id: 'b', name: 'B' })

  it('replaces the package with the matching id', () => {
    const updated = pkg({ id: 'a', name: 'A renamed' })
    expect(mergePackageUpdate([a, b], updated)).toEqual([updated, b])
  })

  it('leaves the list alone when nothing matches', () => {
    expect(mergePackageUpdate([a, b], pkg({ id: 'c' }))).toEqual([a, b])
  })

  it('does not mutate the original list', () => {
    const list = [a, b]
    mergePackageUpdate(list, pkg({ id: 'a', name: 'changed' }))
    expect(list[0]?.name).toBe('A')
  })

  it('accepts an empty list', () => {
    expect(mergePackageUpdate([], a)).toEqual([])
  })
})

describe('formatDependencies', () => {
  it('says None rather than showing an empty line', () => {
    expect(formatDependencies([])).toBe('None')
  })

  it('lists one dependency', () => {
    expect(formatDependencies(['core'])).toBe('core')
  })

  it('separates several with commas', () => {
    expect(formatDependencies(['core', 'auth'])).toBe('core, auth')
  })
})

describe('areDependenciesMet', () => {
  const installed = new Set(['core', 'auth'])

  it('is true when every dependency is installed', () => {
    expect(areDependenciesMet(['core'], installed)).toBe(true)
  })

  it('is true for a package with no dependencies', () => {
    expect(areDependenciesMet([], installed)).toBe(true)
  })

  it('is false when one is missing', () => {
    expect(areDependenciesMet(['core', 'media'], installed)).toBe(false)
  })

  it('is false when nothing is installed', () => {
    expect(areDependenciesMet(['core'], new Set())).toBe(false)
  })
})

describe('getMissingDependencies', () => {
  const installed = new Set(['core'])

  it('is empty when everything is present', () => {
    expect(getMissingDependencies(['core'], installed)).toEqual([])
  })

  it('names only what is absent', () => {
    expect(getMissingDependencies(['core', 'auth'], installed)).toEqual([
      'auth',
    ])
  })

  it('keeps the declared order', () => {
    expect(getMissingDependencies(['z', 'a'], new Set())).toEqual(['z', 'a'])
  })
})
