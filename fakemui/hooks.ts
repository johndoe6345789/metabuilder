/**
 * FakeMUI Hooks
 * Utility hooks for component accessibility and testing
 */

export interface AccessibleConfig {
  feature: string
  component: string
  identifier: string
}

/**
 * useAccessible Hook
 * Returns data-testid and other accessibility attributes for components
 */
export function useAccessible(config: AccessibleConfig): Record<string, string> {
  const { feature, component, identifier } = config
  return {
    'data-testid': `${feature}-${component}-${identifier}`,
    'data-component': component
  }
}
