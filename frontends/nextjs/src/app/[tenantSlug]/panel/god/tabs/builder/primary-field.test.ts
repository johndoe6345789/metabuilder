import { describe, expect, it } from 'vitest'
import { fieldsFor, primaryField, primaryFieldName } from './primary-field'

describe('fieldsFor', () => {
  it('returns a schema type\'s declared fields', () => {
    expect(fieldsFor('button').map(f => f.name)).toEqual([
      'label',
      'href',
      'variant',
      'action',
      'doneLabel',
      'runWorkflow',
    ])
  })

  it('infers fields from defaults for a type with no schema', () => {
    expect(fieldsFor('not-a-real-type')).toEqual([])
  })
})

describe('primaryFieldName', () => {
  it('picks the first text-typed field for most types', () => {
    expect(primaryFieldName('html.h1')).toBe('text')
    expect(primaryFieldName('button')).toBe('label')
  })

  it('skips a non-primary text field that comes first in the schema', () => {
    // list-item's first text field is its icon (a Material Symbol name),
    // not something a reader sees -- title is the real primary field.
    expect(primaryFieldName('list-item')).toBe('title')
  })

  it('returns undefined for a type with no text-typed field', () => {
    expect(primaryFieldName('grid')).toBeUndefined()
  })
})

describe('primaryField', () => {
  it('returns the full field definition for the primary field', () => {
    expect(primaryField('button')).toMatchObject({
      name: 'label',
      label: 'Button text',
      type: 'text',
    })
  })

  it('returns undefined when there is no primary field', () => {
    expect(primaryField('grid')).toBeUndefined()
  })
})
