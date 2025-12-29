'use client'

import { Box, Button } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// NavigationMenuLink
interface NavigationMenuLinkProps {
  children: ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ children, href, active, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        component={href ? 'a' : 'button'}
        href={href}
        onClick={onClick}
        sx={{
          color: active ? 'primary.main' : 'text.primary',
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 'auto',
          px: 2,
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
NavigationMenuLink.displayName = 'NavigationMenuLink'

// NavigationMenuIndicator
const NavigationMenuIndicator = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        bottom: 0,
        height: 2,
        bgcolor: 'primary.main',
        transition: 'all 0.2s',
      }}
      {...props}
    />
  )
})
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator'

// NavigationMenuViewport
const NavigationMenuViewport = forwardRef<
  HTMLDivElement,
  { children?: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 3,
        overflow: 'hidden',
      }}
      {...props}
    >
      {children}
    </Box>
  )
})
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

// Helper: navigationMenuTriggerStyle (returns sx props for consistent styling)
const navigationMenuTriggerStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 2,
  py: 1,
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: 1,
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: 'action.hover',
  },
  '&:focus': {
    bgcolor: 'action.focus',
  },
})

export {
  NavigationMenuIndicator,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
}
