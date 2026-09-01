import { beforeEach, describe, expect, it } from 'vitest'
import { lsGet, lsSet } from './irc-storage'

beforeEach(() => {
  localStorage.clear()
})

describe('lsGet', () => {
  it('returns the fallback when nothing is stored', () => {
    expect(lsGet('missing', 'default')).toBe('default')
  })

  it('parses and returns a stored value', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }))
    expect(lsGet('k', null)).toEqual({ a: 1 })
  })

  it('returns the fallback on malformed JSON', () => {
    localStorage.setItem('k', '{not json')
    expect(lsGet('k', 'fallback')).toBe('fallback')
  })
})

describe('lsSet', () => {
  it('stores a JSON-serialised value', () => {
    lsSet('k', { a: 1 })
    expect(localStorage.getItem('k')).toBe(JSON.stringify({ a: 1 }))
  })

  it('does not throw when the value is not serialisable', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => lsSet('k', circular)).not.toThrow()
  })
})
