import { describe, expect, it } from 'vitest'

import { filterPackagesBySearch } from '@/lib/admin/package-utils'
import { pkg } from './test-support/package-fixtures'

const packages = [
  pkg({ id: 'a', name: 'Media Center', description: 'Plays video' }),
  pkg({ id: 'b', name: 'Invoices', author: 'Dave', tags: ['billing'] }),
  pkg({ id: 'c', name: 'Chat', description: 'IRC webchat', tags: ['Social'] }),
]

describe('filterPackagesBySearch', () => {
  it('returns everything for an empty or whitespace term', () => {
    expect(filterPackagesBySearch(packages, '')).toHaveLength(3)
    expect(filterPackagesBySearch(packages, '   ')).toHaveLength(3)
  })

  it('matches on name, description, author or tag', () => {
    expect(filterPackagesBySearch(packages, 'media')[0]?.id).toBe('a')
    expect(filterPackagesBySearch(packages, 'video')[0]?.id).toBe('a')
    expect(filterPackagesBySearch(packages, 'dave')[0]?.id).toBe('b')
    expect(filterPackagesBySearch(packages, 'billing')[0]?.id).toBe('b')
  })

  it('ignores case on both sides of the comparison', () => {
    // The tag is "Social" and the term is lowercase.
    expect(filterPackagesBySearch(packages, 'social')[0]?.id).toBe('c')
    expect(filterPackagesBySearch(packages, 'MEDIA')[0]?.id).toBe('a')
  })

  it('returns nothing when nothing matches', () => {
    expect(filterPackagesBySearch(packages, 'zzz')).toEqual([])
  })

  it('does not mutate the list it was given', () => {
    const before = [...packages]
    filterPackagesBySearch(packages, 'media')
    expect(packages).toEqual(before)
  })
})
