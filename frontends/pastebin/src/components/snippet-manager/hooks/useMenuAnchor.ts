import { useState } from 'react'

export function useMenuAnchor() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const openMenu = (el: HTMLElement) => setMenuAnchor(el)
  const closeMenu = () => setMenuAnchor(null)
  return { menuAnchor, openMenu, closeMenu }
}
