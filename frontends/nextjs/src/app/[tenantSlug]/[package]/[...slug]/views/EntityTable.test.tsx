import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityTable } from './EntityTable'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

const schema: EntitySchema = {
  name: 'Post',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'views', type: 'number' },
  ],
}

const table = (props: Partial<Parameters<typeof EntityTable>[0]> = {}) =>
  render(
    <EntityTable
      schema={schema}
      rows={[]}
      tenant="acme"
      pkg="blog"
      entity="Post"
      {...props}
    />
  )

describe('EntityTable', () => {
  it('shows an empty-state row when there are no rows', () => {
    table()
    expect(
      screen.getByText('No Post found. Create one to get started.')
    ).toBeTruthy()
  })

  it('renders one row per item, one cell per schema field', () => {
    table({ rows: [{ id: '1', title: 'Hello', views: 42 }] })
    expect(screen.getByText('Hello')).toBeTruthy()
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('renders a dash for null/undefined field values', () => {
    table({ rows: [{ id: '1', title: null, views: undefined }] })
    expect(screen.getAllByText('-')).toHaveLength(2)
  })

  it('stringifies object field values as JSON', () => {
    table({
      schema: { name: 'Post', fields: [{ name: 'meta', type: 'object' }] },
      rows: [{ id: '1', meta: { a: 1 } }],
    })
    expect(screen.getByText('{"a":1}')).toBeTruthy()
  })

  it('links each row to its detail view keyed by the primary key', () => {
    table({
      schema: { ...schema, primaryKey: 'title' },
      rows: [{ title: 'my-slug', views: 1 }],
    })
    const link = screen.getByText('View') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/acme/blog/Post/my-slug')
  })

  it('renders with a null schema (no field columns, still no crash)', () => {
    table({ schema: null, rows: [{ id: '1' }] })
    expect(screen.getByText('View')).toBeTruthy()
  })
})
