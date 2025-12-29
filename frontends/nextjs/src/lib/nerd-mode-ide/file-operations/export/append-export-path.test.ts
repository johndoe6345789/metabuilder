import { describe, expect,it } from 'vitest'

import { appendExportPath } from './append-export-path'

describe('appendExportPath', () => {
  it('joins segments with trimmed slashes', () => {
    expect(appendExportPath('root/', '/file.txt')).toBe('root/file.txt')
  })

  it('handles empty base path', () => {
    expect(appendExportPath('', 'file.txt')).toBe('file.txt')
  })

  it('handles empty segment', () => {
    expect(appendExportPath('root', '')).toBe('root')
  })
})
