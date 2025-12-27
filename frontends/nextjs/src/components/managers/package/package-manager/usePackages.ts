import { useEffect, useMemo, useState } from 'react'
import { PACKAGE_CATALOG, type PackageCatalogData } from '@/lib/packages/core/package-catalog'
import type { InstalledPackage, PackageManifest } from '@/lib/package-types'
import { listInstalledPackages } from '@/lib/api/packages'

export interface UsePackagesResult {
  packages: PackageManifest[]
  installedPackages: InstalledPackage[]
  filteredPackages: PackageManifest[]
  installedList: PackageManifest[]
  availableList: PackageManifest[]
  categories: string[]
  searchQuery: string
  categoryFilter: string
  sortBy: 'name' | 'downloads' | 'rating'
  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
  setSortBy: (sort: 'name' | 'downloads' | 'rating') => void
  loadPackages: () => Promise<void>
  getCatalogEntry: (packageId: string) => PackageCatalogData | null
}

export function usePackages(): UsePackagesResult {
  const [packages, setPackages] = useState<PackageManifest[]>([])
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'rating'>('downloads')

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    const installed = await listInstalledPackages()
    setInstalledPackages(installed)

    const allPackages = Object.values(PACKAGE_CATALOG).map(pkg => {
      const packageData = pkg()

      return {
        ...packageData.manifest,
        installed: installed.some(ip => ip.packageId === packageData.manifest.id),
      }
    })

    setPackages(allPackages)
  }

  const filteredPackages = useMemo(() => {
    const matchesSearch = (pkg: PackageManifest) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = (pkg: PackageManifest) => categoryFilter === 'all' || pkg.category === categoryFilter

    return packages
      .filter(pkg => matchesSearch(pkg) && matchesCategory(pkg))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'downloads') return b.downloadCount - a.downloadCount
        if (sortBy === 'rating') return b.rating - a.rating
        return 0
      })
  }, [packages, searchQuery, categoryFilter, sortBy])

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(packages.map(p => p.category)))],
    [packages],
  )

  const installedList = useMemo(() => packages.filter(p => p.installed), [packages])
  const availableList = useMemo(() => packages.filter(p => !p.installed), [packages])

  const getCatalogEntry = (packageId: string) => PACKAGE_CATALOG[packageId]?.() ?? null

  return {
    packages,
    installedPackages,
    filteredPackages,
    installedList,
    availableList,
    categories,
    searchQuery,
    categoryFilter,
    sortBy,
    setSearchQuery,
    setCategoryFilter,
    setSortBy,
    loadPackages,
    getCatalogEntry,
  }
}
