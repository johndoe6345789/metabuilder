'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useNavigation } from './useNavigation'

export function Navigation() {
  const { menuOpen, setMenuOpen } = useNavigation()
  return (
    <button
      className="nav-burger-btn"
      onClick={() => setMenuOpen(!menuOpen)}
      aria-label="Toggle navigation menu"
      aria-expanded={menuOpen}
      aria-controls="navigation-sidebar"
      data-testid="navigation-toggle-btn"
      aria-haspopup="menu"
    >
      <MaterialIcon name="list" aria-hidden="true" />
    </button>
  )
}
