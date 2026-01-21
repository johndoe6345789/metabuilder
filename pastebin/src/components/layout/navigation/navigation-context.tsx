import { createContext } from 'react'

interface NavigationContextType {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

/**
 * Navigation Context Provider
 * data-testid: "navigation-context"
 * aria: Used by navigation components with role="navigation"
 */
export const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)
