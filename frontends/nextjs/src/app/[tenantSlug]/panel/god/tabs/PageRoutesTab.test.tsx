import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const routes = vi.hoisted(() => ({ usePageRoutes: vi.fn() }))
vi.mock('@/hooks/usePageRoutes', () => routes)
vi.mock('@/components/tenant/TenantSelect', () => ({
  TenantSelect: (p: { value: string; onChange: (v: string) => void }) => (
    <input aria-label="tenant" value={p.value} readOnly />
  ),
}))
vi.mock('./page-routes/PageList', () => ({
  PageList: ({ pages }: { pages: unknown[] }) => (
    <div>{pages.length} pages</div>
  ),
}))
vi.mock('./page-routes/PageFormDialog', () => ({ PageFormDialog: () => null }))
vi.mock('./page-routes/DeletePageDialog', () => ({
  DeletePageDialog: () => null,
}))

import { PageRoutesTab } from './PageRoutesTab'

const page = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  path: '/home',
  isPublished: true,
  ...over,
})

const stub = (over: Record<string, unknown> = {}): void => {
  routes.usePageRoutes.mockReturnValue({
    pages: [],
    loading: false,
    error: null,
    reload: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...over,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub({ pages: [page(), page({ id: 'p2', isPublished: false })] })
})

describe('PageRoutesTab', () => {
  it('shows the live/draft split as chips', () => {
    render(<PageRoutesTab />)
    expect(screen.getByText('1 live')).toBeTruthy()
    expect(screen.getByText('1 draft')).toBeTruthy()
  })

  it('shows no draft chip when everything is published', () => {
    stub({ pages: [page()] })
    render(<PageRoutesTab />)
    expect(screen.queryByText(/draft/)).toBeNull()
  })

  it('shows loading instead of the list while loading', () => {
    stub({ loading: true })
    render(<PageRoutesTab />)
    expect(screen.getByText('Loading pages…')).toBeTruthy()
  })

  it('shows the offline warning on error', () => {
    stub({ error: 'DBAL down' })
    render(<PageRoutesTab />)
    expect(screen.getByText(/DBAL down/)).toBeTruthy()
  })

  it('starts with the system tenant', () => {
    render(<PageRoutesTab />)
    expect(screen.getByLabelText('tenant')).toHaveProperty('value', 'system')
  })
})
