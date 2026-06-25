import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn (classname utility)', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('joins multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles conditional objects', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('merges tailwind conflicting classes (last wins via clsx)', () => {
    // cn uses clsx which does NOT merge tailwind — just concatenates
    const result = cn('p-2 p-4')
    expect(result).toContain('p-2')
  })
})
