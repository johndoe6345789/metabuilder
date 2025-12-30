/**
 * Permission state management
 * Centralized state for feature flags and database availability
 */

export class PermissionManager {
  private static instance: PermissionManager
  private featureFlags: Map<string, boolean> = new Map()
  private databaseEnabled: boolean = true

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  // Feature Flag Management

  initializeFlags(flags: Record<string, boolean>): void {
    this.featureFlags.clear()
    for (const [key, value] of Object.entries(flags)) {
      this.featureFlags.set(key, value)
    }
  }

  enableFlag(flagName: string): void {
    this.featureFlags.set(flagName, true)
  }

  disableFlag(flagName: string): void {
    this.featureFlags.set(flagName, false)
  }

  isFlagEnabled(flagName: string): boolean {
    return this.featureFlags.get(flagName) === true
  }

  getAllFlags(): Record<string, boolean> {
    const flags: Record<string, boolean> = {}
    for (const [key, value] of this.featureFlags.entries()) {
      flags[key] = value
    }
    return flags
  }

  checkRequiredFlags(requiredFlags: string[]): { allEnabled: boolean; missing: string[] } {
    const missing: string[] = []
    for (const flag of requiredFlags) {
      if (!this.isFlagEnabled(flag)) {
        missing.push(flag)
      }
    }
    return {
      allEnabled: missing.length === 0,
      missing,
    }
  }

  // Database Management

  initializeDatabase(enabled: boolean = true): void {
    this.databaseEnabled = enabled
  }

  enableDatabase(): void {
    this.databaseEnabled = true
  }

  disableDatabase(): void {
    this.databaseEnabled = false
  }

  isDatabaseEnabled(): boolean {
    return this.databaseEnabled
  }

  getDatabaseStatus(): { enabled: boolean; message: string } {
    return {
      enabled: this.databaseEnabled,
      message: this.databaseEnabled ? 'Database is enabled' : 'Database is disabled',
    }
  }

  // Utility Methods

  reset(): void {
    this.featureFlags.clear()
    this.databaseEnabled = true
  }

  getState(): {
    featureFlags: Record<string, boolean>
    databaseEnabled: boolean
  } {
    return {
      featureFlags: this.getAllFlags(),
      databaseEnabled: this.databaseEnabled,
    }
  }
}

// Export singleton instance
export const permissionManager = PermissionManager.getInstance()
