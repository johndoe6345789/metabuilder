import { useState, type ReactNode } from 'react'
import { NavigationContext } from './navigation-context'

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <NavigationContext.Provider value={{ menuOpen, setMenuOpen }} data-testid="navigation-provider">
      {children}
    </NavigationContext.Provider>
  )
}
