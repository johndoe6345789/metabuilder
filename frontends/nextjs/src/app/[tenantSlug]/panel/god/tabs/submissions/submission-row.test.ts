import { describe, expect, it } from 'vitest'

import {
  answerColumns,
  parseAnswers,
  parseReceivedAt,
  parseSubmission,
} from './submission-row'

describe('parseAnswers', () => {
  it('reads the answers an object carries', () => {
    expect(parseAnswers({ name: 'Rosa' })).toEqual({ name: 'Rosa' })
  })

  /**
   * The same shape mismatch that made PageConfig.level arrive as the
   * string "3": an object field can come back as the JSON it was stored
   * as, and reading it as an object then finds no fields at all.
   */
  it('reads answers the adapter handed back as JSON text', () => {
    expect(parseAnswers('{"name":"Rosa"}')).toEqual({ name: 'Rosa' })
  })

  it('is an empty form for text that is not JSON', () => {
    expect(parseAnswers('not json')).toEqual({})
  })

  it.each([null, undefined, 42, '[]'])('is empty for %p', raw => {
    expect(parseAnswers(raw)).toEqual({})
  })

  it('renders a non-text answer rather than dropping it', () => {
    expect(parseAnswers({ agreed: true, count: 2 })).toEqual({
      agreed: 'true',
      count: '2',
    })
  })
})

describe('parseReceivedAt', () => {
  // Forms stamp seconds; a bare number of seconds read as milliseconds
  // dates every message to January 1970.
  it('reads the seconds a form stamps as milliseconds', () => {
    expect(parseReceivedAt(1751500000)).toBe(1751500000000)
  })

  it('reads seconds the adapter handed back as a string', () => {
    expect(parseReceivedAt('1751500000')).toBe(1751500000000)
  })

  it('leaves a value already in milliseconds alone', () => {
    expect(parseReceivedAt(1751500000000)).toBe(1751500000000)
  })

  it.each([null, undefined, '', 'soon', 0, -5])(
    'has no time for %p',
    raw => {
      expect(parseReceivedAt(raw)).toBeNull()
    }
  )
})

describe('parseSubmission', () => {
  it('reads a row the way a form writes one', () => {
    expect(
      parseSubmission({
        id: 'fs_1',
        formName: 'contact',
        path: '/contact',
        data: { name: 'Rosa' },
        createdAt: 1751500000,
      })
    ).toEqual({
      id: 'fs_1',
      formName: 'contact',
      path: '/contact',
      data: { name: 'Rosa' },
      status: 'new',
      receivedAt: 1751500000000,
    })
  })

  // A submission with no status has not been dealt with; forms
  // deliberately never set the field, so every real row arrives this way.
  it('counts a row with no status as new', () => {
    expect(parseSubmission({ id: 'x' }).status).toBe('new')
  })

  it('names an unnamed form rather than showing a blank', () => {
    expect(parseSubmission({ id: 'x' }).formName).toBe('Unnamed form')
  })
})

describe('answerColumns', () => {
  const row = (data: Record<string, string>) =>
    parseSubmission({ id: 'x', data })

  it('is every field used, once, in a stable order', () => {
    expect(
      answerColumns([row({ name: 'a', email: 'b' }), row({ name: 'c' })])
    ).toEqual(['email', 'name'])
  })

  it('is empty for no submissions', () => {
    expect(answerColumns([])).toEqual([])
  })
})
