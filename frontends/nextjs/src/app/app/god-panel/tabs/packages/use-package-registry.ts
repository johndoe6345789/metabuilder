'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PackageContent, PackageManifest } from '@/lib/packages/core/package-types'

/**
 * A package bundles a route→component-tree→workflow pipeline plus styles and
 * assets. `archived` soft-disables it (keeps references intact) instead of
 * deleting.
 */
export interface RegistryPackage {
  manifest: PackageManifest
  content: PackageContent
  archived: boolean
}

const STORAGE_KEY = 'metabuilder.god.packageRegistry'

function emptyContent(): PackageContent {
  return {
    schemas: [], pages: [], workflows: [],
    componentHierarchy: {}, componentConfigs: {},
    cssClasses: [], dropdownConfigs: [],
  }
}

function newManifest(name: string): PackageManifest {
  const now = Date.now()
  return {
    id: `pkg_${now}`, name, version: '0.1.0', description: '',
    author: 'you', category: 'other', icon: 'deployed_code',
    screenshots: [], tags: [], dependencies: [],
    createdAt: now, updatedAt: now, downloadCount: 0, rating: 0,
    installed: false,
  }
}

/** Local package registry with full lifecycle (DBAL sync is a follow-up). */
export function usePackageRegistry() {
  const [packages, setPackages] = useState<RegistryPackage[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPackages(JSON.parse(raw) as RegistryPackage[])
    } catch { /* empty */ }
  }, [])

  const persist = useCallback((next: RegistryPackage[]) => {
    setPackages(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const create = useCallback((name: string): string => {
    const pkg: RegistryPackage = {
      manifest: newManifest(name.trim() || 'Untitled Package'),
      content: emptyContent(), archived: false,
    }
    persist([...packages, pkg])
    return pkg.manifest.id
  }, [packages, persist])

  const update = useCallback((id: string, patch: Partial<PackageManifest>) => {
    persist(packages.map((p) => p.manifest.id === id
      ? { ...p, manifest: { ...p.manifest, ...patch, updatedAt: Date.now() } } : p))
  }, [packages, persist])

  const setArchived = useCallback((id: string, archived: boolean) => {
    persist(packages.map((p) => p.manifest.id === id ? { ...p, archived } : p))
  }, [packages, persist])

  const remove = useCallback((id: string) => {
    persist(packages.filter((p) => p.manifest.id !== id))
  }, [packages, persist])

  const duplicate = useCallback((id: string) => {
    const src = packages.find((p) => p.manifest.id === id)
    if (!src) return
    const copy: RegistryPackage = {
      ...src, archived: false,
      manifest: { ...src.manifest, id: `pkg_${Date.now()}`,
        name: `${src.manifest.name} (copy)`, installed: false },
    }
    persist([...packages, copy])
  }, [packages, persist])

  return { packages, create, update, setArchived, remove, duplicate }
}
