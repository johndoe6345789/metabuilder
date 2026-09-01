import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const apiClient = vi.hoisted(() => ({ fetchEntity: vi.fn() }))
vi.mock('@/lib/entities/api-client', () => apiClient)

import { EntityEditView } from './EntityEditView'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

describe('EntityEditView', () => {
  it('shows the edit title, PUT API URL, and edit actions', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      data: { title: 'Hello' },
      status: 200,
    })
    const jsx = await EntityEditView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema: null,
    })
    render(jsx)
    expect(screen.getByText('Edit Post #42')).toBeTruthy()
    expect(
      screen.getByText('PUT /api/v1/acme/blog/Post/42')
    ).toBeTruthy()
    expect(screen.getByText('Save Changes')).toBeTruthy()
    expect(apiClient.fetchEntity).toHaveBeenCalledWith(
      'acme',
      'blog',
      'Post',
      '42'
    )
  })

  it('renders an EntityLoadError instead of the form when fetch fails', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      error: 'Not found',
      status: 404,
    })
    const jsx = await EntityEditView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema: null,
    })
    render(jsx)
    expect(screen.getByText('Error loading data: Not found')).toBeTruthy()
    expect(screen.queryByText('Save Changes')).toBeNull()
  })

  it('passes the fetched record and schema through to the edit fields', async () => {
    apiClient.fetchEntity.mockResolvedValue({
      data: { title: 'Existing title' },
      status: 200,
    })
    const schema: EntitySchema = {
      name: 'Post',
      fields: [{ name: 'title', type: 'string' }],
    }
    const jsx = await EntityEditView({
      tenant: 'acme',
      pkg: 'blog',
      entity: 'Post',
      id: '42',
      schema,
    })
    render(jsx)
    expect(screen.getByDisplayValue('Existing title')).toBeTruthy()
  })
})
