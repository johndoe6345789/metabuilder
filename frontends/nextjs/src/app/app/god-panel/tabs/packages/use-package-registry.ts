'use client'

import { useCallback } from 'react'
import type { PackageContent, PackageManifest } from '@/lib/packages/core/package-types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPackages } from '@/store/slices/god-slice'

/**
 * A package bundles a route→component-tree→workflow pipeline plus styles and
 * assets. `archived` soft-disables it (keeps references intact) instead of
 * deleting. Persisted in the Redux god slice.
 */
export interface RegistryPackage {
  manifest: PackageManifest
  content: PackageContent
  archived: boolean
}

function emptyContent(): PackageContent {
  return {
    schemas: [], pages: [], workflows: [],
    componentHierarchy: {}, componentConfigs: {},
    cssClasses: [], dropdownConfigs: [],
  }
}

function newManifest(name: string): PackageManifest {
  const t = Date.now()
  return {
    id: `pkg_${t}`, name, version: '0.1.0', description: '',
    author: 'you', category: 'other', icon: 'deployed_code',
    screenshots: [], tags: [], dependencies: [],
    createdAt: t, updatedAt: t, downloadCount: 0, rating: 0, installed: false,
  }
}

export function usePackageRegistry() {
  const dispatch = useAppDispatch()
  const packages: RegistryPackage[] = useAppSelector((s) => s.god.packages)
  const persist = useCallback((next: RegistryPackage[]) => { dispatch(setPackages(next)) }, [dispatch])

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
    persist([...packages, {
      ...src, archived: false,
      manifest: { ...src.manifest, id: `pkg_${Date.now()}`, name: `${src.manifest.name} (copy)`, installed: false },
    }])
  }, [packages, persist])

  return { packages, create, update, setArchived, remove, duplicate }
}
