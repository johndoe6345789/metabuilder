/**
 * React hook for permission checking
 * Provides easy access to permission state in components
 */

'use client'

import { useEffect, useState } from 'react'

import {
  checkComponentPermissions,
  checkPackagePermissions,
  type ComponentPermission,
  type PackagePermissions,
  type PermissionCheckResult,
  type PermissionContext,
} from './check-package-permissions'
import { permissionManager } from './permission-manager'

export interface UsePermissionsOptions {
  userLevel: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface PermissionState {
  featureFlags: Record<string, boolean>
  databaseEnabled: boolean
}

export function usePermissions(options: UsePermissionsOptions) {
  const [state, setState] = useState<PermissionState>(() => permissionManager.getState())

  useEffect(() => {
    if (!options.autoRefresh) return

    const interval = setInterval(() => {
      setState(permissionManager.getState())
    }, options.refreshInterval ?? 1000)

    return () => clearInterval(interval)
  }, [options.autoRefresh, options.refreshInterval])

  const context: PermissionContext = {
    userLevel: options.userLevel as any,
    featureFlags: state.featureFlags,
    databaseEnabled: state.databaseEnabled,
  }

  return {
    // State
    featureFlags: state.featureFlags,
    databaseEnabled: state.databaseEnabled,

    // Permission checking
    checkPackage: (permissions: PackagePermissions): PermissionCheckResult => {
      return checkPackagePermissions(context, permissions)
    },

    checkComponent: (permissions: ComponentPermission): PermissionCheckResult => {
      return checkComponentPermissions(context, permissions)
    },

    // Feature flags
    isFlagEnabled: (flagName: string): boolean => {
      return permissionManager.isFlagEnabled(flagName)
    },

    enableFlag: (flagName: string): void => {
      permissionManager.enableFlag(flagName)
      setState(permissionManager.getState())
    },

    disableFlag: (flagName: string): void => {
      permissionManager.disableFlag(flagName)
      setState(permissionManager.getState())
    },

    // Database
    enableDatabase: (): void => {
      permissionManager.enableDatabase()
      setState(permissionManager.getState())
    },

    disableDatabase: (): void => {
      permissionManager.disableDatabase()
      setState(permissionManager.getState())
    },

    // Refresh
    refresh: (): void => {
      setState(permissionManager.getState())
    },
  }
}
