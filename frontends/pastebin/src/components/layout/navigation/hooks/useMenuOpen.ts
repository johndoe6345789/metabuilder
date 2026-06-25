import { useState } from 'react'

export function useMenuOpen() {
  const [menuOpen, setMenuOpen] = useState(false)
  return { menuOpen, setMenuOpen }
}
