import { describe, it, expect } from 'vitest'
import { toEntityName } from './to-entity-name'

describe('toEntityName', () => {
  it('singularises and capitalises a plural accessor', () => {
    expect(toEntityName('posts')).toBe('Post')
  })

  it('does not strip the s from a double-s name', () => {
    expect(toEntityName('address')).toBe('Address')
  })

  it('capitalises a name that is already singular', () => {
    expect(toEntityName('workflow')).toBe('Workflow')
  })
})
