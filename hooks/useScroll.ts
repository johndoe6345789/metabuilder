import { useRef, useState, useEffect } from 'react'

export function useScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleScroll = () => setScrollPos({ x: el.scrollLeft, y: el.scrollTop })
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return { ref, ...scrollPos }
}
