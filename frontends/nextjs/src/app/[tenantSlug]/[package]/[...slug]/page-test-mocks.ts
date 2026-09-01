// Shared mock state + fixtures for EntityPage's split test files. Kept as
// .ts (no JSX) so it falls outside the 80-line .tsx guardrail.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export const fallbackMod = { tenantPageFallback: vi.fn() }
export const schemaMod = { loadEntitySchema: vi.fn() }
export const navMod = {
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}

export const schema: EntitySchema = { name: 'Post', fields: [] }

export const props = (
  slug: string[],
  tenantSlug = 'acme',
  pkg = 'blog'
) => ({
  params: Promise.resolve({ tenantSlug, package: pkg, slug }),
})

export function mockHeader(p: { entity: string; id?: string }) {
  return createElement(
    'div',
    { 'data-testid': 'header' },
    `${p.entity}|${p.id ?? 'none'}`
  )
}

export function mockListView() {
  return createElement('div', { 'data-testid': 'view-list' })
}

export function mockDetailView(p: { id: string }) {
  return createElement('div', { 'data-testid': 'view-detail' }, p.id)
}

export function mockCreateView() {
  return createElement('div', { 'data-testid': 'view-create' })
}

export function mockEditView(p: { id: string }) {
  return createElement('div', { 'data-testid': 'view-edit' }, p.id)
}
