import { describe, expect, it } from 'vitest'

import {
  interpolate,
  interpolateString,
  interpolateText,
  resolvePath,
} from './interpolate'

const values = {
  new_id: 'id-1',
  count: 3,
  event: { data: { name: 'Rosa', agreed: 'yes' } },
  row: { id: 'r1', title: 'Wheels' },
}

describe('resolvePath', () => {
  it('reads a name', () => {
    expect(resolvePath('new_id', values)).toBe('id-1')
  })

  it('reads through the dots the help text tells founders to write', () => {
    expect(resolvePath('event.data.name', values)).toBe('Rosa')
  })

  it.each(['nope', 'event.data.missing', 'new_id.deeper', ''])(
    'has nothing for %p',
    path => {
      expect(resolvePath(path, values)).toBeUndefined()
    }
  )
})

describe('interpolateText', () => {
  it('splices a reference into a sentence', () => {
    expect(interpolateText('Hello ${event.data.name}!', values)).toBe(
      'Hello Rosa!'
    )
  })

  /**
   * A reference that is the whole value keeps its type: `${row}` handed to
   * a step that wants a row must not arrive as "[object Object]".
   */
  it('keeps the type of a reference that is the whole string', () => {
    expect(interpolateText('${row}', values)).toEqual(values.row)
    expect(interpolateText('${count}', values)).toBe(3)
  })

  it('writes a number spliced into a sentence as text', () => {
    expect(interpolateText('${count} left', values)).toBe('3 left')
  })

  it('leaves a string with no reference alone', () => {
    expect(interpolateText('plain', values)).toBe('plain')
  })

  it('writes an unknown reference as nothing, not as its own text', () => {
    expect(interpolateText('a${nope}b', values)).toBe('ab')
  })

  it('resolves several references in one string', () => {
    expect(interpolateText('${new_id}/${count}', values)).toBe('id-1/3')
  })
})

describe('interpolate', () => {
  it('reaches into the data and filter objects a step carries', () => {
    expect(
      interpolate({ name: '${event.data.name}', tags: ['${new_id}'] }, values)
    ).toEqual({ name: 'Rosa', tags: ['id-1'] })
  })

  it('leaves numbers, booleans and null as they are', () => {
    expect(interpolate({ a: 1, b: true, c: null }, values)).toEqual({
      a: 1,
      b: true,
      c: null,
    })
  })
})

describe('interpolateString', () => {
  it('is always text, whatever the reference held', () => {
    expect(interpolateString('${count}', values)).toBe('3')
    expect(interpolateString('${nope}', values)).toBe('')
  })
})
