'use client'

import { forwardRef, ReactNode } from 'react'
import { Button, Menu } from '@mui/material'
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown'

// NavigationMenuTrigger
interface NavigationMenuTriggerProps {
  children: ReactNode
  className?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        endIcon={<ChevronDownIcon />}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

// NavigationMenuContent
interface NavigationMenuContentProps {
  children: ReactNode
  className?: string
  anchorEl?: HTMLElement | null
  open?: boolean
  onClose?: () => void
}

const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ children, anchorEl, open, onClose, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        anchorEl={anchorEl}
        open={open ?? Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationMenuContent.displayName = 'NavigationMenuContent'

export { NavigationMenuTrigger, NavigationMenuContent }
