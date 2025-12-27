import { useState, type MouseEvent } from 'react'

function useNavigationDropdown() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return {
    anchorEl,
    open,
    handleOpen,
    handleClose,
  }
}

export { useNavigationDropdown }
