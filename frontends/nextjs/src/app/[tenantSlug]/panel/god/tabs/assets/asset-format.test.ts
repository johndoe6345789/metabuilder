import { describe, expect, it } from 'vitest'

import { formatAssetSize, isImageAsset } from './asset-format'

describe('isImageAsset', () => {
  it.each(['photo.png', 'photo.JPG', 'photo.jpeg', 'a.gif', 'a.webp', 'a.svg', 'a.ico'])(
    'recognises %s as an image',
    key => {
      expect(isImageAsset(key)).toBe(true)
    }
  )

  it.each(['doc.pdf', 'notes.txt', 'archive.zip', 'noextension'])(
    'does not treat %s as an image',
    key => {
      expect(isImageAsset(key)).toBe(false)
    }
  )

  it('matches only the file extension, not any substring', () => {
    expect(isImageAsset('png-report.pdf')).toBe(false)
  })
})

describe('formatAssetSize', () => {
  it.each([
    [0, '0 B'],
    [500, '500 B'],
    [1023, '1023 B'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatAssetSize(bytes)).toBe(expected)
  })

  it.each([
    [1024, '1 KB'],
    [2048, '2 KB'],
    [1536, '2 KB'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatAssetSize(bytes)).toBe(expected)
  })

  it.each([
    [1024 * 1024, '1.0 MB'],
    [1024 * 1024 * 8, '8.0 MB'],
    [Math.round(1.5 * 1024 * 1024), '1.5 MB'],
  ])('formats %i bytes as %s', (bytes, expected) => {
    expect(formatAssetSize(bytes)).toBe(expected)
  })

  it('sits right at the KB/MB boundary as MB', () => {
    expect(formatAssetSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatAssetSize(1024 * 1024 - 1)).toBe('1024 KB')
  })
})
