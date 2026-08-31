import { useCallback } from 'react'
import type { RegistryPackage } from './types'

export interface UsePackageLifecycleArgs {
  packages: RegistryPackage[]
  persist: (next: RegistryPackage[]) => void
}

/** Archive, remove, and duplicate -- operations on a package's place in
 *  the list rather than its own fields (use-package-crud.ts). */
export function usePackageLifecycle({
  packages,
  persist,
}: UsePackageLifecycleArgs) {
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

  return { setArchived, remove, duplicate }
}
