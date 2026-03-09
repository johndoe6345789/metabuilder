'use client'

import type {
  PackagePageHandlers,
  PackageStatus,
  ConfirmationOptions,
  ToastOptions,
  PackageInfo,
} from '@/lib/types/package-admin-types'

/**
 * Package Page Handlers
 *
 * Combines hooks and handlers for complete package management workflow.
 * Implements confirmation dialogs, toast notifications, optimistic updates,
 * and error handling patterns.
 *
 * Usage:
 * ```tsx
 * const handlers = createPackagePageHandlers({
 *   usePackages,
 *   usePackageActions,
 *   usePackageDetails,
 *   showConfirmation,
 *   showToast,
 * })
 *
 * return (
 *   <PackageManagementPage
 *     handlers={handlers}
 *   />
 * )
 * ```
 */

interface PageHandlersDependencies {
  /**
   * usePackages hook result
   */
  usePackages: {
    state: any
    handlers: any
    pagination: any
  }

  /**
   * usePackageActions hook result
   */
  usePackageActions: {
    state: any
    handlers: any
    isOperationInProgress: (id: string) => boolean
  }

  /**
   * usePackageDetails hook result
   */
  usePackageDetails: {
    state: any
    handlers: any
  }

  /**
   * Confirmation dialog function
   * Should show modal and return promise
   */
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>

  /**
   * Toast notification function
   */
  showToast: (options: ToastOptions) => void
}

/**
 * Error message generator based on error code
 */
function getErrorMessage(code: string, defaultMessage: string): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    ALREADY_INSTALLED: 'This package is already installed.',
    ALREADY_UNINSTALLED: 'This package is not installed.',
    MISSING_DEPENDENCIES: 'This package has missing dependencies. Please install them first.',
    PACKAGE_NOT_FOUND: 'Package not found. It may have been removed.',
    PERMISSION_DENIED: "You don't have permission to manage packages.",
    DEPENDENCY_ERROR:
      'This package cannot be uninstalled because other packages depend on it.',
    INVALID_PACKAGE_ID: 'Invalid package ID.',
    SERVER_ERROR: 'Server error. Please try again later.',
  }

  return messages[code] || defaultMessage
}

/**
 * Factory function to create all page handlers
 */
export function createPackagePageHandlers(
  deps: PageHandlersDependencies
): PackagePageHandlers {
  const {
    usePackages,
    usePackageActions,
    usePackageDetails,
    showConfirmation,
    showToast,
  } = deps

  /**
   * Handle search input change (debounced via hook)
   */
  const handleSearch = (term: string): void => {
    usePackages.handlers.searchPackages(term)
  }

  /**
   * Handle status filter change
   */
  const handleFilterChange = async (status: PackageStatus): Promise<void> => {
    try {
      await usePackages.handlers.filterByStatus(status)
    } catch (err) {
      const _error = err instanceof Error ? err : new Error(String(err))
      showToast({
        type: 'error',
        message: 'Failed to filter packages',
      })
    }
  }

  /**
   * Handle page change
   */
  const handlePageChange = async (page: number): Promise<void> => {
    try {
      await usePackages.handlers.changePage(page)
    } catch (_err) {
      showToast({
        type: 'error',
        message: 'Failed to change page',
      })
    }
  }

  /**
   * Handle limit change
   */
  const handleLimitChange = async (limit: number): Promise<void> => {
    try {
      await usePackages.handlers.changeLimit(limit)
    } catch (_err) {
      showToast({
        type: 'error',
        message: 'Failed to change page size',
      })
    }
  }

  /**
   * Show package details in modal
   */
  const handleShowDetails = async (packageId: string): Promise<void> => {
    try {
      await usePackageDetails.handlers.openDetails(packageId)
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to load package details')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Close detail modal
   */
  const handleCloseModal = (): void => {
    usePackageDetails.handlers.closeDetails()
  }

  /**
   * Install package with confirmation
   */
  const handleInstall = async (packageId: string): Promise<void> => {
    try {
      // Find package in list for display info
      const pkg = usePackages.state.packages.find((p: PackageInfo) => p.id === packageId)
      if (!pkg) {
        showToast({
          type: 'error',
          message: 'Package not found',
        })
        return
      }

      // Show confirmation
      const confirmed = await showConfirmation({
        title: 'Install Package',
        message: `Are you sure you want to install ${pkg.name}?`,
        confirmLabel: 'Install',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {
          // Execute install
          await usePackageActions.handlers.installPackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: `${pkg.name} installed successfully`,
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to install package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Uninstall package with confirmation
   */
  const handleUninstall = async (packageId: string): Promise<void> => {
    try {
      const pkg = usePackages.state.packages.find((p: PackageInfo) => p.id === packageId)
      if (!pkg) {
        showToast({
          type: 'error',
          message: 'Package not found',
        })
        return
      }

      // Show confirmation with warning
      const confirmed = await showConfirmation({
        title: 'Uninstall Package',
        message: `Are you sure you want to uninstall ${pkg.name}? This action cannot be undone.`,
        confirmLabel: 'Uninstall',
        cancelLabel: 'Cancel',
        variant: 'danger',
        onConfirm: async () => {
          await usePackageActions.handlers.uninstallPackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: `${pkg.name} uninstalled successfully`,
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to uninstall package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Enable package
   */
  const handleEnable = async (packageId: string): Promise<void> => {
    try {
      const pkg = usePackages.state.packages.find((p: PackageInfo) => p.id === packageId)
      if (!pkg) {
        showToast({
          type: 'error',
          message: 'Package not found',
        })
        return
      }

      // Show confirmation
      const confirmed = await showConfirmation({
        title: 'Enable Package',
        message: `Enable ${pkg.name}?`,
        confirmLabel: 'Enable',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {
          await usePackageActions.handlers.enablePackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: `${pkg.name} enabled`,
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to enable package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Disable package
   */
  const handleDisable = async (packageId: string): Promise<void> => {
    try {
      const pkg = usePackages.state.packages.find((p: PackageInfo) => p.id === packageId)
      if (!pkg) {
        showToast({
          type: 'error',
          message: 'Package not found',
        })
        return
      }

      // Show confirmation
      const confirmed = await showConfirmation({
        title: 'Disable Package',
        message: `Disable ${pkg.name}?`,
        confirmLabel: 'Disable',
        cancelLabel: 'Cancel',
        variant: 'warning',
        onConfirm: async () => {
          await usePackageActions.handlers.disablePackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: `${pkg.name} disabled`,
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to disable package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Install from modal
   */
  const handleInstallFromModal = async (packageId: string): Promise<void> => {
    try {
      if (!usePackageDetails.state.selectedPackage) {
        showToast({
          type: 'error',
          message: 'No package selected',
        })
        return
      }

      const confirmed = await showConfirmation({
        title: 'Install Package',
        message: `Install ${usePackageDetails.state.selectedPackage.name}?`,
        confirmLabel: 'Install',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {
          await usePackageActions.handlers.installPackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh modal data
      await usePackageDetails.handlers.refreshDetails()

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: 'Package installed successfully',
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to install package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Uninstall from modal
   */
  const handleUninstallFromModal = async (packageId: string): Promise<void> => {
    try {
      if (!usePackageDetails.state.selectedPackage) {
        showToast({
          type: 'error',
          message: 'No package selected',
        })
        return
      }

      const confirmed = await showConfirmation({
        title: 'Uninstall Package',
        message: `Uninstall ${usePackageDetails.state.selectedPackage.name}? This cannot be undone.`,
        confirmLabel: 'Uninstall',
        cancelLabel: 'Cancel',
        variant: 'danger',
        onConfirm: async () => {
          await usePackageActions.handlers.uninstallPackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Close modal
      usePackageDetails.handlers.closeDetails()

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: 'Package uninstalled successfully',
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to uninstall package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Enable from modal
   */
  const handleEnableFromModal = async (packageId: string): Promise<void> => {
    try {
      const confirmed = await showConfirmation({
        title: 'Enable Package',
        message: `Enable ${usePackageDetails.state.selectedPackage?.name}?`,
        confirmLabel: 'Enable',
        cancelLabel: 'Cancel',
        variant: 'default',
        onConfirm: async () => {
          await usePackageActions.handlers.enablePackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh modal data
      await usePackageDetails.handlers.refreshDetails()

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: 'Package enabled',
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to enable package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  /**
   * Disable from modal
   */
  const handleDisableFromModal = async (packageId: string): Promise<void> => {
    try {
      const confirmed = await showConfirmation({
        title: 'Disable Package',
        message: `Disable ${usePackageDetails.state.selectedPackage?.name}?`,
        confirmLabel: 'Disable',
        cancelLabel: 'Cancel',
        variant: 'warning',
        onConfirm: async () => {
          await usePackageActions.handlers.disablePackage(packageId)
        },
      })

      if (!confirmed) {
        return
      }

      // Refresh modal data
      await usePackageDetails.handlers.refreshDetails()

      // Refresh list
      await usePackages.handlers.refetchPackages()

      showToast({
        type: 'success',
        message: 'Package disabled',
      })
    } catch (err) {
      const error = err as any
      const message = getErrorMessage(error.code, 'Failed to disable package')
      showToast({
        type: 'error',
        message,
      })
    }
  }

  return {
    // List handlers
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    handleShowDetails,
    handleCloseModal,

    // List action handlers
    handleInstall,
    handleUninstall,
    handleEnable,
    handleDisable,

    // Modal action handlers
    handleInstallFromModal,
    handleUninstallFromModal,
    handleEnableFromModal,
    handleDisableFromModal,
  }
}
