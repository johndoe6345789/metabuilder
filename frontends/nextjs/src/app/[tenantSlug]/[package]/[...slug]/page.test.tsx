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

describe('EntityPage param guards', () => {
  it.each([
    ['', 'blog', ['Post']],
    ['acme', '', ['Post']],
    ['acme', 'blog', []],
  ])('calls notFound for missing params (%s/%s)', async (t, p, slug) => {
    await expect(EntityPage(props(slug, t, p))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(fallbackMod.tenantPageFallback).not.toHaveBeenCalled()
  })

  it('returns the DBAL page directly when a fallback exists', async () => {
    fallbackMod.tenantPageFallback.mockResolvedValue(
      <div data-testid="dbal-page" />
    )
    const result = await EntityPage(props(['Post']))
    render(result)
    expect(screen.getByTestId('dbal-page')).toBeTruthy()
    expect(schemaMod.loadEntitySchema).not.toHaveBeenCalled()
  })
})
