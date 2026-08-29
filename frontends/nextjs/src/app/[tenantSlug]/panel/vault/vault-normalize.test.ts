import { describe, expect, it } from 'vitest'

import { draftFromEntry, normalizeSlug } from './vault-normalize'

describe('draftFromEntry', () => {
  it('returns the entry unchanged when editing', () => {
    const entry = {
      slug: 's',
      title: 't',
      username: 'u',
      password: 'p',
      group: 'G',
      notes: 'n',
      loginUrl: '/x',
      appUrl: '/y',
    }
    expect(draftFromEntry(entry)).toBe(entry)
  })

  it('starts a new entry in the General group', () => {
    expect(draftFromEntry(null).group).toBe('General')
  })

  it('defaults the URLs to the app, not to empty strings', () => {
    const draft = draftFromEntry(null)
    expect(draft.loginUrl).toBe('/app/login')
    expect(draft.appUrl).toBe('/app')
  })

  it('leaves the credential fields empty', () => {
    const draft = draftFromEntry(null)
    expect(draft.username).toBe('')
    expect(draft.password).toBe('')
  })
})

describe('normalizeSlug', () => {
  it.each([
    ['My Entry', 'my-entry'],
    ['  padded  ', 'padded'],
    ['UPPER', 'upper'],
    ['a1b2', 'a1b2'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeSlug(input)).toBe(expected)
  })

  it('collapses a run of punctuation into one dash', () => {
    expect(normalizeSlug('a  --  b')).toBe('a-b')
  })

  it('strips leading and trailing dashes', () => {
    expect(normalizeSlug('---a---')).toBe('a')
  })

  it('never emits a doubled dash', () => {
    expect(normalizeSlug('a@#$%b')).toBe('a-b')
  })

  it('folds characters that would need URL escaping', () => {
    expect(normalizeSlug('a/b?c=d#e')).toBe('a-b-c-d-e')
  })

  it('folds non-ASCII rather than passing it through', () => {
    // The accented char folds to a dash, which is then stripped as trailing.
    expect(normalizeSlug('café')).toBe('caf')
    expect(normalizeSlug('naïve name')).toBe('na-ve-name')
  })

  it('answers an empty string when nothing survives', () => {
    expect(normalizeSlug('!!!')).toBe('')
    expect(normalizeSlug('')).toBe('')
  })
})
