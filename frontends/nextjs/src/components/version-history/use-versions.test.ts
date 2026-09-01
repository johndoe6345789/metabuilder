import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const versions = vi.hoisted(() => ({
  getVersion: vi.fn(),
  listVersions: vi.fn(),
}))
vi.mock('@/lib/persist/versions', () => versions)

import { useVersions } from './use-versions'

beforeEach(() => {
  vi.clearAllMocks()
  versions.listVersions.mockResolvedValue([])
})

describe('useVersions', () => {
  it('starts closed and loads the version list on mount', async () => {
    versions.listVersions.mockResolvedValue([
      { id: 'v1', label: 'x', at: 1, data: {} },
    ])
    const { result } = renderHook(() => useVersions('page1'))
    expect(result.current.open).toBe(false)

    await waitFor(() => expect(result.current.versions).toHaveLength(1))
    expect(versions.listVersions).toHaveBeenCalledWith('page1')
  })

  it('toggle opens the list and refreshes it', async () => {
    const { result } = renderHook(() => useVersions('page1'))
    await waitFor(() => expect(versions.listVersions).toHaveBeenCalledTimes(1))

    act(() => result.current.toggle())

    expect(result.current.open).toBe(true)
    await waitFor(() =>
      expect(versions.listVersions).toHaveBeenCalledTimes(2)
    )
  })

  it('toggle closes without refreshing again', async () => {
    const { result } = renderHook(() => useVersions('page1'))
    await waitFor(() => expect(versions.listVersions).toHaveBeenCalledTimes(1))
    act(() => result.current.toggle())
    await waitFor(() => expect(versions.listVersions).toHaveBeenCalledTimes(2))

    act(() => result.current.toggle())

    expect(result.current.open).toBe(false)
    expect(versions.listVersions).toHaveBeenCalledTimes(2)
  })

  it('close sets open to false', async () => {
    const { result } = renderHook(() => useVersions('page1'))
    act(() => result.current.toggle())
    expect(result.current.open).toBe(true)

    act(() => result.current.close())

    expect(result.current.open).toBe(false)
  })

  it('restore delegates to getVersion for the current key', async () => {
    versions.getVersion.mockResolvedValue({ hello: 'world' })
    const { result } = renderHook(() => useVersions('page1'))

    const data = await result.current.restore('v1')

    expect(versions.getVersion).toHaveBeenCalledWith('page1', 'v1')
    expect(data).toEqual({ hello: 'world' })
  })
})
