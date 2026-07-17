import { useState, useRef, useEffect, RefObject } from 'react'

export interface DropdownState {
  open: boolean
  ref: RefObject<HTMLDivElement | null>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/** Generic dropdown open/close with outside-click detection */
export function useDropdown(): DropdownState {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return { open, ref, setOpen }
}
