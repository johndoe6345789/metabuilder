import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const apiClient = vi.hoisted(() => ({ fetchEntity: vi.fn() }))
vi.mock('@/lib/entities/api-client', () => apiClient)

import { EntityDetailView } from './EntityDetailView'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityDetailView', () => {
  it('renders the entity title, id, and an Edit link', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      data: { title: 'Hello' },
      status: 200,
    })
    const jsx = await EntityDetailView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema: null,
    })
    render(jsx)
    expect(screen.getByText('Post #42')).toBeTruthy()
    const editLink = screen.getByText('Edit').closest('a')
    expect(editLink?.getAttribute('href')).toBe('/acme/blog/Post/42/edit')
    expect(apiClient.fetchEntity).toHaveBeenCalledWith(
      'acme',
      'blog',
      'Post',
      '42'
    )
  })

  it('renders an EntityLoadError when the fetch reports an error', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      error: 'Not found',
      status: 404,
    })
    const jsx = await EntityDetailView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema: null,
    })
    render(jsx)
    expect(screen.getByText('Error loading data: Not found')).toBeTruthy()
  })

  it('renders schema-driven fields from the fetched record', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      data: { title: 'Hello world' },
      status: 200,
    })
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    const jsx = await EntityDetailView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema,
    })
    render(jsx)
    expect(screen.getByText('Hello world')).toBeTruthy()
  })
})
