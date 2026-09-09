import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const scope = vi.hoisted(() => ({
  useCurrentTenantScope: vi.fn(() => ({
    tenant: 'harbour',
    canPickOtherTenant: false,
  })),
}))
const counts = vi.hoisted(() => ({ countTenantData: vi.fn() }))
vi.mock('../use-current-tenant-scope', () => scope)
vi.mock('./tenant-data-counts', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, countTenantData: counts.countTenantData }
})

import { useTenantData } from './use-tenant-data'

const row = (key: string, rows: number | null) => ({
  key,
  path: `core/${key}`,
  rows,
  more: false,
})

beforeEach(() => {
  vi.clearAllMocks()
  counts.countTenantData.mockResolvedValue([row('users', 2), row('pages', 3)])
})

const ready = async () => {
  const hook = renderHook(() => useTenantData())
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false)
  })
  return hook
}

describe('useTenantData', () => {
  it("counts the community whose panel this is", async () => {
    await ready()
    expect(counts.countTenantData).toHaveBeenCalledWith('harbour')
  })

  it('adds the rows up', async () => {
    const { result } = await ready()
    expect(result.current.total).toBe(5)
  })

  it('is not "unreadable" when something was read', async () => {
    const { result } = await ready()
    expect(result.current.unreadable).toBe(false)
  })

  // Every collection failing is a data layer that is down, not an empty
  // community, and the card says so differently.
  it('is unreadable when nothing could be read at all', async () => {
    counts.countTenantData.mockResolvedValue([
      row('users', null),
      row('pages', null),
    ])
    const { result } = await ready()
    expect(result.current.unreadable).toBe(true)
  })

  it('counts a partly readable community as readable', async () => {
    counts.countTenantData.mockResolvedValue([
      row('users', null),
      row('pages', 3),
    ])
    const { result } = await ready()
    expect(result.current.unreadable).toBe(false)
    expect(result.current.total).toBe(3)
  })
})
