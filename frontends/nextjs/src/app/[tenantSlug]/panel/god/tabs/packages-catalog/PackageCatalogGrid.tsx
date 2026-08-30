'use client'

import { PRODUCT_PACKAGES } from '@/lib/packages/product-packages'
import { PackageCatalogCard } from './PackageCatalogCard'
import type { usePackagesTab } from '../use-packages-tab'
import s from '../PackagesTab.module.scss'

export function PackageCatalogGrid({
  tab,
}: {
  tab: ReturnType<typeof usePackagesTab>
}) {
  return (
    <div className={s.grid}>
      {PRODUCT_PACKAGES.map(pkg => (
        <PackageCatalogCard
          key={pkg.id}
          pkg={pkg}
          installed={!tab.registry.loading && tab.registry.isInstalled(pkg.id)}
          busy={tab.busy === pkg.id}
          blocked={tab.registry.error !== null}
          onInstall={() => {
            void tab.install(pkg.id)
          }}
          onUninstall={() => {
            void tab.uninstall(pkg.id)
          }}
        />
      ))}
    </div>
  )
}
