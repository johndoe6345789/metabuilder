'use client'

import { useCallback, useState } from 'react'
import type {
  PackageContent,
  PackageManifest,
} from '@/lib/packages/core/package-types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPackages } from '@/store/slices/god-slice'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** id + a display label captured at search-select time, so the "Package
 * contents" list can render readable names without re-fetching each
 * referenced row on every draft render. Only `id` is sent to DBAL on
 * publish -- `label` is UI-only. */
export interface PackageRef {
  id: string
  label: string
}

/**
 * A package bundles a route→component-tree→workflow pipeline plus styles and
 * assets. `archived` soft-disables it (keeps references intact) instead of
 * deleting. Persisted in the Redux god slice as a working draft; `content`
 * is unused so far (kept for a future richer bundle shape) -- the
 * references a package actually composes today live in the three fields
 * below, flattened to bare id arrays and sent to the real GodPackage DBAL
 * entity on publish.
 */
export interface RegistryPackage {
  manifest: PackageManifest
  content: PackageContent
  archived: boolean
  workflows: PackageRef[]
  pageConfigs: PackageRef[]
  themeId: string | null
  /** Set once publish() succeeds; lets the UI show "published" vs. "draft". */
  publishedId: string | null
}

function emptyContent(): PackageContent {
  return {
    schemas: [],
    pages: [],
    workflows: [],
    componentHierarchy: {},
    componentConfigs: {},
    cssClasses: [],
    dropdownConfigs: [],
  }
}

function newManifest(name: string): PackageManifest {
  const t = Date.now()
  return {
    id: `pkg_${t}`,
    name,
    version: '0.1.0',
    description: '',
    author: 'you',
    category: 'other',
    icon: 'deployed_code',
    screenshots: [],
    tags: [],
    dependencies: [],
    createdAt: t,
    updatedAt: t,
    downloadCount: 0,
    rating: 0,
    installed: false,
  }
}

export function usePackageRegistry() {
  const dispatch = useAppDispatch()
  const packages: RegistryPackage[] = useAppSelector(s => s.god.packages)
  const persist = useCallback(
    (next: RegistryPackage[]) => {
      dispatch(setPackages(next))
    },
    [dispatch]
  )

  const create = useCallback(
    (name: string): string => {
      const pkg: RegistryPackage = {
        manifest: newManifest(name.trim() || 'Untitled Package'),
        content: emptyContent(),
        archived: false,
        workflows: [],
        pageConfigs: [],
        themeId: null,
        publishedId: null,
      }
      persist([...packages, pkg])
      return pkg.manifest.id
    },
    [packages, persist]
  )

  const update = useCallback(
    (id: string, patch: Partial<PackageManifest>) => {
      persist(
        packages.map(p =>
          p.manifest.id === id
            ? {
                ...p,
                manifest: { ...p.manifest, ...patch, updatedAt: Date.now() },
              }
            : p
        )
      )
    },
    [packages, persist]
  )

  /** Patches the reference fields a package composes -- separate from
   * update() above, which only touches PackageManifest. */
  const updateContents = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<RegistryPackage, 'workflows' | 'pageConfigs' | 'themeId'>
      >
    ) => {
      persist(
        packages.map(p => (p.manifest.id === id ? { ...p, ...patch } : p))
      )
    },
    [packages, persist]
  )

  const setArchived = useCallback(
    (id: string, archived: boolean) => {
      persist(
        packages.map(p => (p.manifest.id === id ? { ...p, archived } : p))
      )
    },
    [packages, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(packages.filter(p => p.manifest.id !== id))
    },
    [packages, persist]
  )

  const duplicate = useCallback(
    (id: string) => {
      const src = packages.find(p => p.manifest.id === id)
      if (!src) return
      persist([
        ...packages,
        {
          ...src,
          archived: false,
          // A copy is a new, unpublished draft -- referencing the same
          // workflows/pages/theme is fine (they're shared rows, not owned
          // by the package), but it hasn't been published itself yet.
          publishedId: null,
          manifest: {
            ...src.manifest,
            id: `pkg_${Date.now()}`,
            name: `${src.manifest.name} (copy)`,
            installed: false,
          },
        },
      ])
    },
    [packages, persist]
  )

  const [publishing, setPublishing] = useState<string | null>(null)

  /** POSTs (or, once already published, PUTs) the package's current draft
   * to the real GodPackage entity. sortOrder/isPublished are sent
   * explicitly rather than relying on the schema's defaults -- matching
   * what PageConfig and InstalledPackage's schemas required earlier this
   * session, GodPackage's validator rejects a request missing either even
   * though both carry a default. */
  const publish = useCallback(
    async (id: string, tenant = 'system'): Promise<boolean> => {
      const pkg = packages.find(p => p.manifest.id === id)
      if (!pkg) return false
      setPublishing(id)
      try {
        const payload = {
          name: pkg.manifest.name,
          description:
            pkg.manifest.description.length > 0
              ? pkg.manifest.description
              : null,
          category: pkg.manifest.category,
          icon: pkg.manifest.icon,
          workflowIds: JSON.stringify(pkg.workflows.map(w => w.id)),
          pageConfigIds: JSON.stringify(pkg.pageConfigs.map(pc => pc.id)),
          themeId: pkg.themeId,
          version: pkg.manifest.version,
          tenantId: tenant,
          sortOrder: 0,
          isPublished: true,
          updatedAt: Date.now(),
        }
        const res =
          pkg.publishedId != null
            ? await fetch(
                `${DBAL}/${tenant}/core/GodPackage/${pkg.publishedId}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                  signal: AbortSignal.timeout(8000),
                }
              )
            : await fetch(`${DBAL}/${tenant}/core/GodPackage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, createdAt: Date.now() }),
                signal: AbortSignal.timeout(8000),
              })
        if (!res.ok) return false
        if (pkg.publishedId == null) {
          const json = (await res.json()) as { data?: { id?: string } }
          const newId = json.data?.id
          if (newId != null) {
            persist(
              packages.map(p =>
                p.manifest.id === id ? { ...p, publishedId: newId } : p
              )
            )
          }
        }
        return true
      } catch {
        return false
      } finally {
        setPublishing(null)
      }
    },
    [packages, persist]
  )

  return {
    packages,
    create,
    update,
    updateContents,
    setArchived,
    remove,
    duplicate,
    publish,
    publishing,
  }
}
