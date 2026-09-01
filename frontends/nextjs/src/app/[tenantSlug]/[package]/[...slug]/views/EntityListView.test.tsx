import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const apiClient = vi.hoisted(() => ({ fetchEntityList: vi.fn() }))
vi.mock('@/lib/entities/api-client', () => apiClient)

import { EntityListView } from './EntityListView'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityListView', () => {
  it('shows the entity list title, API URL, and a new-entity link', async () => {
    apiClient.fetchEntityList.mockResolvedValue({ data: [], status: 200 })
    const jsx = await EntityListView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      schema: null,
    })
    render(jsx)
    expect(screen.getByText('Post List')).toBeTruthy()
    expect(screen.getByText('/api/v1/acme/blog/Post')).toBeTruthy()
    const newLink = screen.getByText('+ New Post').closest('a')
    expect(newLink?.getAttribute('href')).toBe('/acme/blog/Post/new')
    expect(apiClient.fetchEntityList).toHaveBeenCalledWith(
      'acme',
      'blog',
      'Post'
    )
  })

  it('shows an inline error banner when the fetch fails', async () => {
    apiClient.fetchEntityList.mockResolvedValue({
      error: 'Service unavailable',
      status: 503,
    })
    const jsx = await EntityListView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      schema: null,
    })
    render(jsx)
    expect(
      screen.getByText('Error loading data: Service unavailable')
    ).toBeTruthy()
  })

  it('renders fetched rows in the entity table', async () => {
    apiClient.fetchEntityList.mockResolvedValue({
      data: [{ title: 'First post' }],
      status: 200,
    })
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    const jsx = await EntityListView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      schema,
    })
    render(jsx)
    expect(screen.getByText('First post')).toBeTruthy()
  })
})
