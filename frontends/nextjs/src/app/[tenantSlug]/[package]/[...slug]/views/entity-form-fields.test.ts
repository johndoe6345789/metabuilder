import { describe, expect, it } from 'vitest'

import {
  fieldKind,
  formFields,
  initialValues,
  toRecord,
} from './entity-form-fields'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

const schema = (
  fields: { name: string; type: string; description?: string }[]
): EntitySchema => ({ name: 'User', fields })

describe('fieldKind', () => {
  it.each([
    ['integer', 'number'],
    ['Number', 'number'],
    ['boolean', 'boolean'],
    ['json', 'json'],
    ['string', 'text'],
  ])('reads the schema type %p as %p', (declared, expected) => {
    expect(fieldKind(declared, undefined)).toBe(expected)
  })

  it.each([
    [3, 'number'],
    [true, 'boolean'],
    [{ a: 1 }, 'json'],
    ['x', 'text'],
    [null, 'text'],
  ])('infers %p as %p when nothing declares it', (value, expected) => {
    expect(fieldKind(undefined, value)).toBe(expected)
  })
})

describe('formFields', () => {
  it('uses the schema when there is one', () => {
    const fields = formFields(
      schema([{ name: 'email', type: 'string', description: 'Their email' }]),
      {}
    )
    expect(fields).toEqual([
      { name: 'email', kind: 'text', hint: 'Their email' },
    ])
  })

  /** The schema lives in a package directory, so most entities have none
   *  and the form offered nothing at all. */
  it('falls back to what the record carries', () => {
    const fields = formFields(null, { id: 'u1', age: 3, ok: true })
    expect(fields.map(f => [f.name, f.kind])).toEqual([
      ['id', 'text'],
      ['age', 'number'],
      ['ok', 'boolean'],
    ])
  })

  it('has no fields for an empty record and no schema', () => {
    expect(formFields(null, {})).toEqual([])
  })
})

describe('initialValues', () => {
  const fields = formFields(null, { id: 'u1', age: 3, meta: { a: 1 } })

  it('shows text as itself and everything else as JSON', () => {
    expect(initialValues(fields, { id: 'u1', age: 3, meta: { a: 1 } })).toEqual(
      { id: 'u1', age: '3', meta: '{"a":1}' }
    )
  })

  it('shows an absent value as an empty box', () => {
    expect(initialValues(fields, {})).toEqual({ id: '', age: '', meta: '' })
  })
})

describe('toRecord', () => {
  const fields = formFields(null, { name: 'x', age: 1, ok: true, meta: {} })

  it('sends each field as what it holds', () => {
    expect(
      toRecord(fields, { name: 'Rosa', age: '4', ok: 'true', meta: '{"a":1}' })
    ).toEqual({ name: 'Rosa', age: 4, ok: true, meta: { a: 1 } })
  })

  /**
   * An edit form sends only what was filled in: a blank box means "left
   * alone", and sending "" would overwrite a real value with nothing.
   */
  it('leaves an empty box out entirely', () => {
    expect(toRecord(fields, { name: 'Rosa', age: '', ok: '', meta: '  ' }))
      .toEqual({ name: 'Rosa' })
  })

  it('keeps unreadable JSON as the text that was typed', () => {
    expect(toRecord(fields, { meta: 'not json' })).toEqual({
      meta: 'not json',
    })
  })

  it('keeps an unreadable number as the text that was typed', () => {
    expect(toRecord(fields, { age: 'seven' })).toEqual({ age: 'seven' })
  })

  it('reads anything but "true" as false', () => {
    expect(toRecord(fields, { ok: 'false' })).toEqual({ ok: false })
  })
})

describe('required fields', () => {
  it('marks the ones the schema says are required', () => {
    const fields = formFields(
      {
        name: 'Post',
        fields: [
          { name: 'title', type: 'string', required: true },
          { name: 'body', type: 'string' },
        ],
      },
      {}
    )
    expect(fields.map(f => [f.name, f.required === true])).toEqual([
      ['title', true],
      ['body', false],
    ])
  })
})
