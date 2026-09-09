import { useEffect, useState } from 'react'
import { readRow } from '@/lib/db/read-list'

const DBAL_URL =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080')
    : 'http://localhost:8080'

export interface PackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  dependencies: string[]
  level: number
  category: string
  icon: string
}

function fallbackMetadata(packageId: string): PackageMetadata {
  return {
    packageId,
    name: packageId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    version: '1.0.0',
    description: `Package: ${packageId}`,
    dependencies: [],
    level: 2,
    category: 'general',
    icon: packageId.charAt(0).toUpperCase(),
  }
}

/** Fetches a package's metadata from DBAL, falling back to a derived
 *  placeholder (offline, or DBAL has no record for it yet) rather than
 *  showing an empty page. */
export function usePackageMetadata(packageId: string) {
  const [metadata, setMetadata] = useState<PackageMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    /**
     * Any answer that is not a row gets the placeholder.
     *
     * Only the `catch` used to reach it, so a 404 -- which is exactly
     * the "DBAL has no record for it yet" case the comment above names,
     * and far likelier than the daemon being unreachable -- left the
     * metadata null and the page rendered "Package Not Found" for a
     * package the founder had installed and could see in their sidebar.
     */
    const settle = (found: PackageMetadata | null) => {
      if (!live) return
      setMetadata(found ?? fallbackMetadata(packageId))
      setLoading(false)
    }

    fetch(`${DBAL_URL}/system/core/package/${packageId}`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(async res =>
        res.ok ? readRow<PackageMetadata>(await res.json()) : null
      )
      .then(settle)
      .catch(() => {
        settle(null)
      })
    return () => {
      live = false
    }
  }, [packageId])

  return { metadata, loading }
}
