import { useEffect, useState } from 'react'

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
    fetch(`${DBAL_URL}/system/core/package/${packageId}`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: PackageMetadata } | null) => {
        if (json?.data != null) setMetadata(json.data)
        setLoading(false)
      })
      .catch(() => {
        setMetadata(fallbackMetadata(packageId))
        setLoading(false)
      })
  }, [packageId])

  return { metadata, loading }
}
