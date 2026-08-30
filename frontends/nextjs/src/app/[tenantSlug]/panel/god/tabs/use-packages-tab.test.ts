import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const registry = vi.hoisted(() => ({ useInstalledPackages: vi.fn() }))
vi.mock('@/hooks/useInstalledPackages', () => registry)

const data = vi.hoisted(() => ({ createDefaultPages: vi.fn() }))
vi.mock('./packages-tab-data', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, createDefaultPages: data.createDefaultPages }
})

import { usePackagesTab } from './use-packages-tab'

const registryValue = (over: Record<string, unknown> = {}) => ({
  isInstalled: vi.fn(() => false),
  installedRecord: vi.fn(() => undefined),
  install: vi.fn(async () => undefined),
  uninstall: vi.fn(async () => undefined),
  loading: false,
  error: null,
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  registry.useInstalledPackages.mockReturnValue(registryValue())
  data.createDefaultPages.mockResolvedValue(undefined)
})

describe('usePackagesTab', () => {
  it('starts on the system tenant', () => {
    const { result } = renderHook(() => usePackagesTab())
    expect(result.current.tenant).toBe('system')
  })

  it('loads a real tenant name', () => {
    const { result } = renderHook(() => usePackagesTab())
    act(() => {
      result.current.setTenantInput('acme')
    })
    act(() => {
      result.current.applyTenant()
    })
    expect(result.current.tenant).toBe('acme')
  })

  it('accepts the tenant passed directly, without waiting on state', () => {
    const { result } = renderHook(() => usePackagesTab())
    act(() => {
      result.current.applyTenant('acme')
    })
    expect(result.current.tenant).toBe('acme')
  })

  it('falls back to system for a blank tenant', () => {
    const { result } = renderHook(() => usePackagesTab())
    act(() => {
      result.current.setTenantInput('   ')
      result.current.applyTenant()
    })
    expect(result.current.tenant).toBe('system')
  })

  describe('install', () => {
    it('installs the registry entry and provisions its pages', async () => {
      const reg = registryValue()
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.install('pages')
      })

      expect(reg.install).toHaveBeenCalledWith('pages')
      expect(data.createDefaultPages).toHaveBeenCalled()
      expect(result.current.flash).toContain('installed')
    })

    it('does nothing for a package id that is not in the catalog', async () => {
      const reg = registryValue()
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.install('not-a-real-package')
      })

      expect(reg.install).not.toHaveBeenCalled()
    })

    it('reports a failure rather than throwing', async () => {
      const reg = registryValue({
        install: vi.fn(async () => {
          throw new Error('DBAL down')
        }),
      })
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.install('pages')
      })

      expect(result.current.flash).toContain('Failed to install')
    })

    it('is not busy once the install settles', async () => {
      const { result } = renderHook(() => usePackagesTab())
      await act(async () => {
        await result.current.install('pages')
      })
      expect(result.current.busy).toBeNull()
    })
  })

  describe('uninstall', () => {
    it('removes the installed record', async () => {
      const reg = registryValue({
        installedRecord: vi.fn(() => ({ id: 'rec1' })),
      })
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.uninstall('pages')
      })

      expect(reg.uninstall).toHaveBeenCalledWith('rec1')
      expect(result.current.flash).toContain('removed')
    })

    it('does nothing when there is no installed record', async () => {
      const reg = registryValue()
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.uninstall('pages')
      })

      expect(reg.uninstall).not.toHaveBeenCalled()
    })

    it('reports a failure rather than throwing', async () => {
      const reg = registryValue({
        installedRecord: vi.fn(() => ({ id: 'rec1' })),
        uninstall: vi.fn(async () => {
          throw new Error('DBAL down')
        }),
      })
      registry.useInstalledPackages.mockReturnValue(reg)
      const { result } = renderHook(() => usePackagesTab())

      await act(async () => {
        await result.current.uninstall('pages')
      })

      expect(result.current.flash).toContain('Failed to remove')
    })
  })

  it('clears the flash message on demand', async () => {
    const { result } = renderHook(() => usePackagesTab())
    await act(async () => {
      await result.current.install('pages')
    })
    await waitFor(() => {
      expect(result.current.flash).not.toBeNull()
    })
    act(() => {
      result.current.setFlash(null)
    })
    expect(result.current.flash).toBeNull()
  })
})
