'use client'

import { Alert } from '@/m3'
import { PackageManager } from './packages/PackageManager'
import { PackageCatalogGrid } from './packages-catalog/PackageCatalogGrid'
import { PackagesTabHeader } from './packages-catalog/PackagesTabHeader'
import { usePackagesTab } from './use-packages-tab'
import s from './PackagesTab.module.scss'

export function PackagesTab() {
  const tab = usePackagesTab()

  return (
    <div className={s.root}>
      <PackagesTabHeader
        tenantInput={tab.tenantInput}
        onTenantInputChange={next => {
          tab.setTenantInput(next)
          tab.applyTenant(next)
        }}
        onLoad={() => {
          tab.applyTenant()
        }}
      />

      {tab.registry.error !== null && (
        <Alert severity="warning">
          DBAL offline — showing available packages only.
        </Alert>
      )}
      {tab.flash !== null && (
        <Alert
          severity="info"
          onClose={() => {
            tab.setFlash(null)
          }}
        >
          {tab.flash}
        </Alert>
      )}

      <PackageCatalogGrid tab={tab} />
      <PackageManager tenant={tab.tenant} />
    </div>
  )
}
