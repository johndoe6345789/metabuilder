import { useState, useEffect } from 'react'

export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setPosition({ x: window.scrollX, y: window.scrollY })
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}
