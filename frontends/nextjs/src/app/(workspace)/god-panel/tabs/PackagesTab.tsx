'use client'

import { useState } from 'react'
import { Typography, Alert, Chip, Button } from '@/m3'
import { useInstalledPackages } from '@/hooks/useInstalledPackages'
import {
  PRODUCT_PACKAGES,
  defaultComponentTree,
} from '@/lib/packages/product-packages'
import { PackageManager } from './packages/PackageManager'
import s from './PackagesTab.module.scss'
import { TenantSelect } from '@/components/tenant/TenantSelect'
import { saveTree, type TreeNodeShape } from '@/lib/tenant/page-tree'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

const SYSTEM = 'system'

async function createDefaultPages(
  tenant: string,
  pkg: (typeof PRODUCT_PACKAGES)[number]
): Promise<void> {
  const base = `${DBAL}/${tenant}/core/PageConfig`
  await Promise.all(
    pkg.defaultRoutes.map(async route => {
      // The starter layout is rows, so the route can point at a tree rather
      // than carry one.
      const treeId = `tree_${pkg.id}_${route.path.replace(/[^a-z0-9]+/gi, '_')}`
      const wrote = await saveTree(
        DBAL,
        tenant,
        treeId,
        route.title,
        defaultComponentTree(route.title) as unknown as TreeNodeShape,
        `Starter layout for ${pkg.id}`
      )
      return fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: route.path,
          title: route.title,
          isPublished: true,
          level: 0, // public, per ROLE_LEVELS
          requiresAuth: false,
          sortOrder: 0,
          packageId: pkg.id,
          tenantId: tenant,
          pageTreeId: wrote ? treeId : null,
        }),
      })
    })
  )
}

export function PackagesTab() {
  const [tenant, setTenant] = useState(SYSTEM)
  const [tenantInput, setTenantInput] = useState(SYSTEM)
  const { isInstalled, installedRecord, install, uninstall, loading, error } =
    useInstalledPackages(tenant)
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const applyTenant = (next?: string) => {
    const t = (next ?? tenantInput).trim()
    setTenant(t.length > 0 ? t : SYSTEM)
  }

  const handleInstall = async (pkgId: string) => {
    const pkg = PRODUCT_PACKAGES.find(p => p.id === pkgId)
    if (pkg === undefined) return
    setBusy(pkgId)
    try {
      await install(pkgId)
      await createDefaultPages(tenant, pkg)
      setFlash(`${pkg.name} installed — pages are live.`)
    } catch {
      setFlash(`Failed to install ${pkg.name}`)
    } finally {
      setBusy(null)
    }
  }

  const handleUninstall = async (pkgId: string) => {
    const record = installedRecord(pkgId)
    if (record === undefined) return
    setBusy(pkgId)
    try {
      await uninstall(record.id)
      setFlash(`${pkgId} removed`)
    } catch {
      setFlash(`Failed to remove ${pkgId}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="h6">Packages</Typography>
        <Typography variant="body2" color="text.secondary">
          Install features for a tenant. Each package adds pages and navigation
          instantly.
        </Typography>
        <div className={s.tenantRow}>
          <TenantSelect
            id="packages-tenant"
            value={tenantInput}
            onChange={next => {
              setTenantInput(next)
              applyTenant(next)
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              applyTenant()
            }}
          >
            Load
          </Button>
        </div>
      </div>

      {error !== null && (
        <Alert severity="warning">
          DBAL offline — showing available packages only.
        </Alert>
      )}
      {flash !== null && (
        <Alert
          severity="info"
          onClose={() => {
            setFlash(null)
          }}
        >
          {flash}
        </Alert>
      )}

      <div className={s.grid}>
        {PRODUCT_PACKAGES.map(pkg => {
          const on = !loading && isInstalled(pkg.id)
          const isBusy = busy === pkg.id
          return (
            <div key={pkg.id} className={`${s.card} ${on ? s.active : ''}`}>
              <div
                className={s.iconWrap}
                style={{
                  background: `color-mix(
                    in srgb, ${pkg.color} 15%, transparent
                  )`,
                }}
              >
                <span
                  className="material-symbols-rounded"
                  style={{ color: pkg.color }}
                >
                  {pkg.icon}
                </span>
              </div>
              <div className={s.meta}>
                <div className={s.nameRow}>
                  <span className={s.name}>{pkg.name}</span>
                  {on && (
                    <Chip label="Installed" size="small" color="success" />
                  )}
                </div>
                <p className={s.tagline}>{pkg.tagline}</p>
                <ul className={s.features}>
                  {pkg.features.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className={s.foot}>
                {on ? (
                  <button
                    className={s.btnRemove}
                    disabled={isBusy}
                    onClick={() => {
                      void handleUninstall(pkg.id)
                    }}
                  >
                    {isBusy ? 'Removing…' : 'Remove'}
                  </button>
                ) : (
                  <button
                    className={s.btnInstall}
                    disabled={isBusy || error !== null}
                    onClick={() => {
                      void handleInstall(pkg.id)
                    }}
                  >
                    {isBusy ? 'Installing…' : 'Install'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <PackageManager tenant={tenant} />
    </div>
  )
}
