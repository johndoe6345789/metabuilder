import { useRef, useState } from 'react'

export function useHover<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isHovered, setIsHovered] = useState(false)

  const onMouseEnter = () => setIsHovered(true)
  const onMouseLeave = () => setIsHovered(false)

  return { ref, isHovered, onMouseEnter, onMouseLeave }
}
