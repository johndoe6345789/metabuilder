import { useRef, useEffect } from 'react'

export function useDebugInfo(name: string, info: any) {
  const prevRef = useRef(info)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${name}]`, { prev: prevRef.current, current: info })
    }
    prevRef.current = info
  }, [info, name])
  return info
}
