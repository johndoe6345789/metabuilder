'use client'

import { useState } from 'react'
import { useInstalledPackages } from '@/hooks/useInstalledPackages'
import { PRODUCT_PACKAGES } from '@/lib/packages/product-packages'
import { createDefaultPages } from './packages-tab-data'
import { useTenantPicker } from './use-tenant-picker'

/**
 * Installing and removing packages for the currently loaded tenant.
 *
 * The tenant came from a picker of this hook's own that started at
 * 'system' and had no guard, so a founder opening this tab saw the shared
 * tenant's installed list, and installing wrote PageConfig and PageTree
 * rows into it while flashing "pages are live" -- about a community that
 * was not theirs. useTenantPicker is the guarded one the Page Routes tab
 * already used.
 */
export function usePackagesTab() {
  const {
    tenant,
    tenantInput,
    setTenantInput,
    applyTenant,
    canPickOtherTenant,
  } = useTenantPicker()
  const registry = useInstalledPackages(tenant)
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const install = async (pkgId: string): Promise<void> => {
    const pkg = PRODUCT_PACKAGES.find(p => p.id === pkgId)
    if (pkg === undefined) return
    setBusy(pkgId)
    try {
      await registry.install(pkgId)
      await createDefaultPages(tenant, pkg)
      setFlash(`${pkg.name} installed — pages are live.`)
    } catch {
      setFlash(`Failed to install ${pkg.name}`)
    } finally {
      setBusy(null)
    }
  }

  const uninstall = async (pkgId: string): Promise<void> => {
    const record = registry.installedRecord(pkgId)
    if (record === undefined) return
    setBusy(pkgId)
    try {
      await registry.uninstall(record.id)
      setFlash(`${pkgId} removed`)
    } catch {
      setFlash(`Failed to remove ${pkgId}`)
    } finally {
      setBusy(null)
    }
  }

  return {
    tenant,
    tenantInput,
    setTenantInput,
    applyTenant,
    /** False for everyone but the instance owner, so the tab can stop
     *  offering a box that will only ever be refused. */
    canPickOtherTenant,
    registry,
    busy,
    flash,
    setFlash,
    install,
    uninstall,
  }
}
