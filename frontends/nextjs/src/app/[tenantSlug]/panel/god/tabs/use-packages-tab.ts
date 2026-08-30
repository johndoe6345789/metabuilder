'use client'

import { useState } from 'react'
import { useInstalledPackages } from '@/hooks/useInstalledPackages'
import { PRODUCT_PACKAGES } from '@/lib/packages/product-packages'
import {
  createDefaultPages,
  normalizeTenant,
  SYSTEM_TENANT,
} from './packages-tab-data'

/** Installing and removing packages for the currently loaded tenant. */
export function usePackagesTab() {
  const [tenant, setTenant] = useState(SYSTEM_TENANT)
  const [tenantInput, setTenantInput] = useState(SYSTEM_TENANT)
  const registry = useInstalledPackages(tenant)
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const applyTenant = (next?: string): void => {
    setTenant(normalizeTenant(next ?? tenantInput))
  }

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
    registry,
    busy,
    flash,
    setFlash,
    install,
    uninstall,
  }
}
