'use client'

/**
 * Which packages a tenant has installed.
 *
 * Wraps useDbalCollection with the two questions callers actually ask --
 * is this package on, and which row is it -- so the Packages tab does not
 * re-implement either.
 */

import { useCallback } from 'react'

import { useDbalCollection } from '@/lib/dbal/use-dbal-collection'
import type { InstalledPackage } from './installed-package-types'

export type { InstalledPackage } from './installed-package-types'

export function useInstalledPackages(tenant: string) {
  const { items, loading, error, reload, create, remove } =
    useDbalCollection<InstalledPackage>({
      tenant,
      entity: 'InstalledPackage',
      timeoutMs: 6000,
    })

  const install = useCallback(
    (packageId: string) =>
      create({
        packageId,
        tenantId: tenant,
        version: '1.0.0',
        enabled: true,
        installedAt: Date.now(),
      }),
    [create, tenant]
  )

  /** Installed but disabled is not installed, as far as callers care. */
  const isInstalled = useCallback(
    (packageId: string): boolean =>
      items.some(p => p.packageId === packageId && p.enabled),
    [items]
  )

  const installedRecord = useCallback(
    (packageId: string): InstalledPackage | undefined =>
      items.find(p => p.packageId === packageId),
    [items]
  )

  return {
    installed: items,
    loading,
    error,
    reload,
    install,
    uninstall: remove,
    isInstalled,
    installedRecord,
  }
}
