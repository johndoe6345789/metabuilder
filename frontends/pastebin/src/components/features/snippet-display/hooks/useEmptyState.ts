import { useState } from 'react'

export function useEmptyState() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  return { menuAnchor, setMenuAnchor }
}
