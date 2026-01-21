'use client'

import { List } from '@phosphor-icons/react'
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
      <List weight="bold" aria-hidden="true" />
    </button>
  )
}
