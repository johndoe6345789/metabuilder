import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  fallbackMod,
  schemaMod,
  navMod,
  schema,
  props,
  mockHeader,
  mockListView,
  mockDetailView,
  mockCreateView,
  mockEditView,
} from './page-test-mocks'

vi.mock('./tenant-page-fallback', () => fallbackMod)
vi.mock('@/lib/entities/load-entity-schema', () => schemaMod)
vi.mock('next/navigation', () => navMod)
vi.mock('./metadata', () => ({ generateMetadata: vi.fn() }))
vi.mock('./EntityPageHeader', () => ({ EntityPageHeader: mockHeader }))
vi.mock('./views/EntityListView', () => ({
  EntityListView: mockListView,
}))
vi.mock('./views/EntityDetailView', () => ({
  EntityDetailView: mockDetailView,
}))
vi.mock('./views/EntityCreateView', () => ({
  EntityCreateView: mockCreateView,
}))
vi.mock('./views/EntityEditView', () => ({
  EntityEditView: mockEditView,
}))

import EntityPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  fallbackMod.tenantPageFallback.mockResolvedValue(null)
  schemaMod.loadEntitySchema.mockResolvedValue(schema)
})

describe('EntityPage view dispatch', () => {
  it('renders the list view with no id/action for a bare slug', async () => {
    const result = await EntityPage(props(['Post']))
    render(result)
    expect(screen.getByTestId('view-list')).toBeTruthy()
    expect(screen.getByTestId('header').textContent).toBe('Post|none')
  })

  it('renders the create view for id "new"', async () => {
    const result = await EntityPage(props(['Post', 'new']))
    render(result)
    expect(screen.getByTestId('view-create')).toBeTruthy()
  })

  it('renders the detail view for an id with no action', async () => {
    const result = await EntityPage(props(['Post', '42']))
    render(result)
    expect(screen.getByTestId('view-detail').textContent).toBe('42')
    expect(screen.getByTestId('header').textContent).toBe('Post|42')
  })

  it('renders the edit view for an id with action "edit"', async () => {
    const result = await EntityPage(props(['Post', '42', 'edit']))
    render(result)
    expect(screen.getByTestId('view-edit').textContent).toBe('42')
  })

  it('loads the schema for the given package and entity', async () => {
    const result = await EntityPage(props(['Post'], 'acme', 'blog'))
    render(result)
    expect(schemaMod.loadEntitySchema).toHaveBeenCalledWith('blog', 'Post')
  })
})
