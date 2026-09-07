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
      // Appended to every block: anything can run a workflow when clicked.
      'onClickWorkflow',
    ])
  })

  it('infers fields from defaults for a type with no schema', () => {
    expect(fieldsFor('not-a-real-type').map(f => f.name)).toEqual([
      'onClickWorkflow',
    ])
  })

  it('offers the click field on every block, not just the controls', () => {
    for (const type of ['html.h1', 'grid', 'image', 'button']) {
      expect(fieldsFor(type).map(f => f.name)).toContain('onClickWorkflow')
    }
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

  /**
   * The click field is text-typed and on every block, so without an
   * explicit exclusion it would become the primary field of anything that
   * declares no text of its own -- a Grid's auto-generated id would come
   * from the name of a workflow, and the Properties tab would lead with
   * it rather than with what the block is about.
   */
  it('returns undefined for a type with no text-typed field', () => {
    expect(primaryFieldName('grid')).toBeUndefined()
  })

  it('never treats the click field as what a block is about', () => {
    for (const type of ['grid', 'html.hr', 'm3.divider']) {
      expect(primaryFieldName(type)).not.toBe('onClickWorkflow')
    }
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
