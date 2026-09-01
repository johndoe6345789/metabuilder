import { useCallback } from 'react'
import type { PackageManifest } from '@/lib/packages/core/package-types'
import type { RegistryPackage } from './types'
import { emptyContent } from './empty-content'
import { newManifest } from './new-manifest'

export interface UsePackageCrudArgs {
  packages: RegistryPackage[]
  persist: (next: RegistryPackage[]) => void
}

/** Create and edit operations on the package list -- everything except
 *  archive/remove/duplicate (use-package-lifecycle.ts) and publishing
 *  (use-publish-package.ts, which talks to DBAL). */
export function usePackageCrud({ packages, persist }: UsePackageCrudArgs) {
  const create = useCallback(
    (name: string): string => {
      const trimmed = name.trim()
      const pkg: RegistryPackage = {
        manifest: newManifest(trimmed.length > 0 ? trimmed : 'Untitled Package'),
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

  return { create, update, updateContents }
}
