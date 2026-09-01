import { describe, expect, it } from 'vitest'
import { badge } from './test-badge'

describe('badge', () => {
  it('is a dash for no result yet', () => {
    expect(badge(undefined)).toEqual({ cls: '', label: '—' })
  })

  it('is a green check for a pass', () => {
    expect(badge({ status: 'pass' })).toEqual({
      cls: 'pass',
      label: '✓ Pass',
    })
  })

  it('is a red cross for a fail', () => {
    expect(badge({ status: 'fail' })).toEqual({
      cls: 'fail',
      label: '✕ Fail',
    })
  })

  it('is a warning for a runtime error', () => {
    expect(badge({ status: 'error' })).toEqual({
      cls: 'err',
      label: '⚠ Error',
    })
  })
})
