'use client'

import { useCallback, useState, type MouseEvent } from 'react'

function useDropdownState<TAnchor extends HTMLElement = HTMLElement>() {
  const [anchorEl, setAnchorEl] = useState<TAnchor | null>(null)

  const open = Boolean(anchorEl)

  const handleOpen = useCallback((event: MouseEvent<TAnchor>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return { anchorEl, open, setAnchorEl, handleOpen, handleClose }
}

export { useDropdownState }
