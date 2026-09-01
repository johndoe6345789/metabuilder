import { useCallback, useState } from 'react'
import type { RegistryPackage } from './types'
import { buildPublishPayload } from './build-publish-payload'
import { publishPackageRequest } from './publish-package-request'

export interface UsePublishPackageArgs {
  packages: RegistryPackage[]
  persist: (next: RegistryPackage[]) => void
}

/** Publishes a package's current draft to the real GodPackage DBAL
 *  entity, and records the id it was published as once that succeeds. */
export function usePublishPackage({
  packages,
  persist,
}: UsePublishPackageArgs) {
  const [publishing, setPublishing] = useState<string | null>(null)

  const publish = useCallback(
    async (id: string, tenant = 'system'): Promise<boolean> => {
      const pkg = packages.find(p => p.manifest.id === id)
      if (pkg === undefined) return false
      setPublishing(id)
      try {
        const payload = buildPublishPayload(pkg, tenant)
        const res = await publishPackageRequest(
          payload,
          pkg.publishedId,
          tenant
        )
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

  return { publish, publishing }
}
