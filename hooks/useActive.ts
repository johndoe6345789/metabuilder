import { useRef, useState } from 'react'

export function useActive<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isActive, setIsActive] = useState(false)

  const onMouseDown = () => setIsActive(true)
  const onMouseUp = () => setIsActive(false)

  return { ref, isActive, onMouseDown, onMouseUp }
}
