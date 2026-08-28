import { describe, expect, it } from 'vitest'

import { sortPackages } from '@/lib/admin/package-utils'
import { pkg } from './test-support/package-fixtures'

const packages = [
  pkg({ id: 'b', name: 'beta', rating: 3, downloadCount: 50, updatedAt: 200 }),
  pkg({ id: 'a', name: 'Alpha', rating: 5, downloadCount: 10, updatedAt: 300 }),
  pkg({ id: 'c', name: 'gamma', rating: 4, downloadCount: 90, updatedAt: 100 }),
]

const ids = (list: { id: string }[]): string[] => list.map(p => p.id)

describe('sortPackages', () => {
  it('sorts by name without letting case decide the order', () => {
    // "Alpha" would sort before "beta" on raw codepoints too, but "Beta" vs
    // "alpha" would not -- the comparison lowercases both.
    expect(ids(sortPackages(packages, 'name'))).toEqual(['a', 'b', 'c'])
  })

  it('sorts by rating, downloads and date', () => {
    expect(ids(sortPackages(packages, 'rating'))).toEqual(['b', 'c', 'a'])
    expect(ids(sortPackages(packages, 'downloads'))).toEqual(['a', 'b', 'c'])
    expect(ids(sortPackages(packages, 'date'))).toEqual(['c', 'b', 'a'])
  })

  it('reverses when ascending is false', () => {
    expect(ids(sortPackages(packages, 'rating', false))).toEqual([
      'a',
      'c',
      'b',
    ])
  })

  it('returns a new array and leaves the original order alone', () => {
    const before = ids(packages)
    const sorted = sortPackages(packages, 'name')

    expect(sorted).not.toBe(packages)
    expect(ids(packages)).toEqual(before)
  })

  it('keeps equal items together rather than reordering them', () => {
    const tied = [
      pkg({ id: 'x', rating: 4 }),
      pkg({ id: 'y', rating: 4 }),
      pkg({ id: 'z', rating: 4 }),
    ]
    expect(ids(sortPackages(tied, 'rating'))).toEqual(['x', 'y', 'z'])
  })

  it('leaves the list untouched for an unknown field', () => {
    const out = sortPackages(packages, 'nope' as never)
    expect(ids(out)).toEqual(ids(packages))
  })
})
