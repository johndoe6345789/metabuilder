/**
 * Hook for level-based routing functionality
 * 
 * Provides permission checking and routing based on the 6-level system:
 * 0: public, 1: user, 2: moderator, 3: admin, 4: god, 5: supergod
 */

import { useRouter } from 'next/navigation'
import { useResolvedUser } from './useResolvedUser'

export interface LevelRouting {
  /** Check if current user can access a given permission level */
  canAccessLevel: (requiredLevel: number) => boolean
  /** Redirect user to an appropriate page for their level */
  redirectToLevel: (targetLevel: number) => void
  /** Current user's permission level */
  currentLevel: number
  /** Whether the user check is still loading */
  isLoading: boolean
}

/** Route mappings for each permission level */
const LEVEL_ROUTES: Record<number, string> = {
  0: '/',           // Public home
  1: '/dashboard',  // User dashboard
  2: '/moderate',   // Moderator panel
  3: '/admin',      // Admin panel
  4: '/god',        // God panel
  5: '/supergod',   // Supergod panel
}

/**
 * Hook for managing level-based routing
 * Uses the resolved user state to check permissions.
 */
export function useLevelRouting(): LevelRouting {
  const router = useRouter()
  const { level, isLoading } = useResolvedUser()

  const canAccessLevel = (requiredLevel: number): boolean => {
    if (isLoading) {
      return false // Don't grant access while loading
    }
    return level >= requiredLevel
  }

  const redirectToLevel = (targetLevel: number): void => {
    const route = LEVEL_ROUTES[targetLevel] ?? LEVEL_ROUTES[0]
    if (route !== undefined) {
      router.push(route)
    }
  }

  return {
    canAccessLevel,
    redirectToLevel,
    currentLevel: level,
    isLoading,
  }
}
