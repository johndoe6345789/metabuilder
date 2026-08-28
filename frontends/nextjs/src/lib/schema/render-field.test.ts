import { describe, expect, it } from 'vitest'

import { renderSchemaField, type FieldSpec } from './render-field'

const field = (over: Partial<FieldSpec> = {}): FieldSpec => ({
  name: 'title',
  type: 'string',
  ...over,
})

describe('renderSchemaField identity', () => {
  it('marks a field named id as the primary key', () => {
    expect(renderSchemaField(field({ name: 'id' }))).toContain('@id')
  })

  it.each(['id', 'primary', 'isId'] as const)(
    'accepts %s as the spelling for primary',
    flag => {
      const line = renderSchemaField(field({ name: 'ref', [flag]: true }))
      expect(line).toContain('@id')
    }
  )

  it('refuses a name that is not a valid identifier', () => {
    // A name with a space would emit source that does not parse; returning
    // null drops the field rather than corrupting the whole model.
    expect(renderSchemaField(field({ name: 'not valid' }))).toBeNull()
    expect(renderSchemaField(field({ name: '' }))).toBeNull()
  })
})

describe('renderSchemaField optionality', () => {
  it.each(['nullable', 'optional'] as const)('treats %s as optional', flag => {
    expect(renderSchemaField(field({ [flag]: true }))).toContain('?')
  })

  it('treats required:false as optional', () => {
    expect(renderSchemaField(field({ required: false }))).toContain('?')
  })

  it('leaves a required field unmarked', () => {
    expect(renderSchemaField(field({ required: true }))).not.toContain('?')
  })
})

describe('renderSchemaField shape', () => {
  it('names the field first', () => {
    expect(renderSchemaField(field())?.startsWith('title')).toBe(true)
  })

  it('renders a list as a list', () => {
    const line = renderSchemaField(field({ list: true }))
    expect(line).toContain('[]')
  })

  it('marks a unique field', () => {
    expect(renderSchemaField(field({ unique: true }))).toContain('@unique')
  })
})

describe('renderSchemaField list spellings', () => {
  it.each(['list', 'array'] as const)(
    'honours the %s flag, not only the type suffix',
    flag => {
      // Both spellings live on FieldSpec. Only the type suffix was read, so a
      // field declared with the flag rendered as a scalar.
      const line = renderSchemaField(field({ name: 'tags', [flag]: true }))
      expect(line).toContain('[]')
    }
  )

  it('still reads a list off the type string', () => {
    expect(renderSchemaField(field({ type: 'String[]' }))).toContain('[]')
  })

  it('does not double up when the type and the flag agree', () => {
    const line = renderSchemaField(field({ type: 'String[]', list: true }))
    expect(line?.match(/\[\]/g)).toHaveLength(1)
  })
})
