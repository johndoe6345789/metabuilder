import { useRef, useEffect } from 'react'

export function useRender() {
  const renders = useRef(0)
  useEffect(() => {
    renders.current++
  })
  return renders.current
}
