import { type ReactNode } from 'react'
import { NavigationContext } from './navigation-context'
import { useMenuOpen } from './hooks/useMenuOpen'

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { menuOpen, setMenuOpen } = useMenuOpen()

  return (
    <NavigationContext.Provider
      value={{ menuOpen, setMenuOpen }}
      data-testid="navigation-provider"
    >
      {children}
    </NavigationContext.Provider>
  )
}
