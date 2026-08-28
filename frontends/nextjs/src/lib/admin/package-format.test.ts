import { describe, expect, it } from 'vitest'

import {
  formatNumber,
  formatPackageCategory,
  formatPackageStatus,
  formatRating,
  formatVersion,
  getPlaceholderIconUrl,
  truncateText,
} from '@/lib/admin/package-utils'

describe('formatPackageStatus', () => {
  it('titles the statuses it knows and passes through the rest', () => {
    expect(formatPackageStatus('installed')).toBe('Installed')
    expect(formatPackageStatus('available')).toBe('Available')
    expect(formatPackageStatus('disabled')).toBe('Disabled')
    expect(formatPackageStatus('quarantined')).toBe('quarantined')
  })
})

describe('formatPackageCategory', () => {
  it('turns snake_case into words', () => {
    expect(formatPackageCategory('developer_tools')).toBe('Developer Tools')
    expect(formatPackageCategory('media')).toBe('Media')
  })

  it('leaves an empty category empty rather than throwing', () => {
    expect(formatPackageCategory('')).toBe('')
  })
})

describe('formatVersion', () => {
  it('keeps the semver head and drops any suffix', () => {
    expect(formatVersion('1.2.3')).toBe('1.2.3')
    expect(formatVersion('1.2.3-beta.1')).toBe('1.2.3')
  })

  it('returns anything unparseable unchanged', () => {
    expect(formatVersion('latest')).toBe('latest')
    expect(formatVersion('1.2')).toBe('1.2')
  })
})

describe('formatNumber', () => {
  it('abbreviates thousands and millions', () => {
    expect(formatNumber(1_500)).toBe('1.5K')
    expect(formatNumber(2_400_000)).toBe('2.4M')
  })

  it('leaves small numbers alone, including the boundaries', () => {
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(1_000)).toBe('1.0K')
    expect(formatNumber(1_000_000)).toBe('1.0M')
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatRating', () => {
  it('always shows one decimal, so ratings line up in a column', () => {
    expect(formatRating(4)).toBe('4.0')
    expect(formatRating(4.25)).toBe('4.3')
  })
})

describe('truncateText', () => {
  it('only shortens what is longer than the limit', () => {
    expect(truncateText('short', 10)).toBe('short')
    expect(truncateText('exactly-ten', 11)).toBe('exactly-ten')
    expect(truncateText('a longer sentence', 6)).toBe('a long...')
  })
})

describe('getPlaceholderIconUrl', () => {
  it('escapes the id so an odd package name cannot break the URL', () => {
    expect(getPlaceholderIconUrl('my pkg&x')).toContain('my%20pkg%26x')
  })
})
