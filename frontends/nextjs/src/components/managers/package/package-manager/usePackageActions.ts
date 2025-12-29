import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { installPackage, togglePackageEnabled, uninstallPackage } from '@/lib/api/packages'
import type { PackageCatalogData } from '@/lib/packages/core/package-catalog'

interface UsePackageActionsProps {
  loadPackages: () => Promise<void>
  getCatalogEntry: (packageId: string) => PackageCatalogData | undefined
}

export function usePackageActions({ loadPackages, getCatalogEntry }: UsePackageActionsProps) {
  const [installing, setInstalling] = useState(false)

  const resolvePackage = useCallback(
    (packageId: string) => {
      const packageEntry = getCatalogEntry(packageId)
      if (!packageEntry) {
        toast.error('Package not found')
        return null
      }
      return packageEntry
    },
    [getCatalogEntry]
  )

  const handleInstallPackage = useCallback(
    async (packageId: string, onComplete?: () => void) => {
      setInstalling(true)
      const packageEntry = resolvePackage(packageId)
      if (!packageEntry) {
        setInstalling(false)
        return
      }

      try {
        await installPackage(packageId)
        toast.success(`${packageEntry.manifest.name} installed successfully!`)
        await loadPackages()
        onComplete?.()
      } catch (error) {
        console.error('Installation error:', error)
        toast.error('Failed to install package')
      } finally {
        setInstalling(false)
      }
    },
    [loadPackages, resolvePackage]
  )

  const handleUninstallPackage = useCallback(
    async (packageId: string, onComplete?: () => void) => {
      const packageEntry = resolvePackage(packageId)
      if (!packageEntry) return

      try {
        await uninstallPackage(packageId)
        toast.success(`${packageEntry.manifest.name} uninstalled successfully!`)
        await loadPackages()
        onComplete?.()
      } catch (error) {
        console.error('Uninstallation error:', error)
        toast.error('Failed to uninstall package')
      }
    },
    [loadPackages, resolvePackage]
  )

  const handleTogglePackage = useCallback(
    async (packageId: string, enabled: boolean) => {
      try {
        await togglePackageEnabled(packageId, enabled)
        toast.success(enabled ? 'Package enabled' : 'Package disabled')
        await loadPackages()
      } catch (error) {
        console.error('Toggle error:', error)
        toast.error('Failed to toggle package')
      }
    },
    [loadPackages]
  )

  return { installing, handleInstallPackage, handleUninstallPackage, handleTogglePackage }
}
