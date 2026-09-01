import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EntityPageHeader } from './EntityPageHeader'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityPageHeader', () => {
  it('falls back to the entity name when the schema has no displayName', () => {
    render(
      <EntityPageHeader
        tenantSlug="acme"
        pkg="blog"
        entity="Post"
        id={undefined}
        schema={null}
      />
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Post'
    )
  })

  it('prefers the schema displayName over the entity name', () => {
    const schema = { name: 'Post', fields: [], displayName: 'Blog Post' } as
      EntitySchema
    render(
      <EntityPageHeader
        tenantSlug="acme"
        pkg="blog"
        entity="Post"
        id={undefined}
        schema={schema}
      />
    )
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Blog Post'
    )
  })

  it('shows the id crumb for a real record id', () => {
    render(
      <EntityPageHeader
        tenantSlug="acme"
        pkg="blog"
        entity="Post"
        id="42"
        schema={null}
      />
    )
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('omits the id crumb for the "new" pseudo-id', () => {
    render(
      <EntityPageHeader
        tenantSlug="acme"
        pkg="blog"
        entity="Post"
        id="new"
        schema={null}
      />
    )
    expect(screen.queryByText('new')).toBeNull()
  })

  it('renders the schema description when present', () => {
    const schema = {
      name: 'Post',
      fields: [],
      description: 'Blog posts for the tenant',
    } as EntitySchema
    render(
      <EntityPageHeader
        tenantSlug="acme"
        pkg="blog"
        entity="Post"
        id={undefined}
        schema={schema}
      />
    )
    expect(screen.getByText('Blog posts for the tenant')).toBeTruthy()
  })
})
