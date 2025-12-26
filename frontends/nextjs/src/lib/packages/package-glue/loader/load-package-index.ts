export interface PackageIndexEntry {
  packageId: string
  name: string
  version: string
  description?: string
  author?: string
  category?: string
  dependencies?: string[]
  exports?: { components?: unknown[] }
}

interface PackageIndexResponse {
  packages?: PackageIndexEntry[]
}

export async function loadPackageIndex(): Promise<PackageIndexEntry[] | null> {
  try {
    const response = await fetch('/packages/index.json', { cache: 'no-store' })
    if (!response.ok) return null

    const data = (await response.json()) as PackageIndexResponse
    if (!data?.packages || !Array.isArray(data.packages)) {
      return null
    }

    return data.packages
  } catch (error) {
    return null
  }
}
