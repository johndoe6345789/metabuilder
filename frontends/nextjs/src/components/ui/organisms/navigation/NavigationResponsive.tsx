import { Menu as MenuIcon } from '@/fakemui/icons'
import { IconButton } from '@mui/material'
import { forwardRef } from 'react'

interface NavigationMobileToggleProps {
  onClick: () => void
}

const NavigationMobileToggle = forwardRef<HTMLButtonElement, NavigationMobileToggleProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        edge="start"
        color="inherit"
        sx={{
          display: { sm: 'none' },
          mr: 2,
        }}
        {...props}
      >
        <MenuIcon />
      </IconButton>
    )
  }
)
NavigationMobileToggle.displayName = 'NavigationMobileToggle'

export { NavigationMobileToggle }
