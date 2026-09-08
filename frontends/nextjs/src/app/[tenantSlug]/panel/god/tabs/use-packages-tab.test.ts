import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const registry = vi.hoisted(() => ({ useInstalledPackages: vi.fn() }))
vi.mock('@/hooks/useInstalledPackages', () => registry)

const scopeMod = vi.hoisted(() => ({ useCurrentTenantScope: vi.fn() }))
vi.mock('./use-current-tenant-scope', () => scopeMod)

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
  scopeMod.useCurrentTenantScope.mockReturnValue({
    tenant: 'harbour_cycle_works',
    canPickOtherTenant: false,
  })
})

describe('usePackagesTab', () => {
  /**
   * This tab kept its own tenant state that started at 'system' and had no
   * guard, so a founder opening Packages saw the shared tenant's installed
   * list -- and installing wrote PageConfig and PageTree rows into it while
   * flashing "pages are live" about a community that was not theirs. Any
   * god could also drive another community's packages by typing its name.
   */
  it('starts on the founder’s own community, not the shared one', () => {
    const { result } = renderHook(() => usePackagesTab())
    expect(result.current.tenant).toBe('harbour_cycle_works')
  })

  it('will not be pointed elsewhere by an ordinary founder', () => {
    const { result } = renderHook(() => usePackagesTab())
    act(() => {
      result.current.applyTenant('acme')
    })
    expect(result.current.tenant).toBe('harbour_cycle_works')
    expect(result.current.canPickOtherTenant).toBe(false)
  })

  it('lets the instance owner point it elsewhere', () => {
    scopeMod.useCurrentTenantScope.mockReturnValue({
      tenant: 'system',
      canPickOtherTenant: true,
    })
    const { result } = renderHook(() => usePackagesTab())
    act(() => {
      result.current.applyTenant('acme')
    })
    expect(result.current.tenant).toBe('acme')
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
