import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityDetailFields } from './EntityDetailFields'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

const schema: EntitySchema = {
  name: 'Post',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'meta', type: 'object' },
  ],
}

describe('EntityDetailFields', () => {
  it('renders each field name and its value', () => {
    render(
      <EntityDetailFields schema={schema} record={{ title: 'Hello' }} />
    )
    expect(screen.getByText('title:')).toBeTruthy()
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('renders a dash for a null/undefined value', () => {
    render(
      <EntityDetailFields
        schema={{ name: 'Post', fields: [{ name: 'title', type: 'string' }] }}
        record={{}}
      />
    )
    expect(screen.getByText('-')).toBeTruthy()
  })

  it('stringifies an object value as JSON', () => {
    render(
      <EntityDetailFields schema={schema} record={{ meta: { a: 1 } }} />
    )
    expect(screen.getByText('{"a":1}')).toBeTruthy()
  })

  /**
   * The schema is loaded from a package directory, so most entities have
   * none -- and this rendered a detail page with no detail on it at all.
   * The record says what it carries.
   */
  it('shows what the record carries when no schema declares it', () => {
    const { container } = render(
      <EntityDetailFields schema={null} record={{ title: 'Hello' }} />
    )
    expect(container.textContent).toContain('title')
    expect(container.textContent).toContain('Hello')
  })

  it('shows nothing for a record with nothing in it', () => {
    const { container } = render(
      <EntityDetailFields schema={null} record={{}} />
    )
    expect(container.textContent).toBe('')
  })
})
