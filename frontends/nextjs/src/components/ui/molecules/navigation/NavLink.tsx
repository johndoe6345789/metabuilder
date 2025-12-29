'use client'

import { Box, Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

export interface NavLinkProps extends Omit<MuiLinkProps, 'component'> {
  href: string
  active?: boolean
  disabled?: boolean
  children: ReactNode
  icon?: ReactNode
  className?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, active = false, disabled = false, children, icon, sx, ...props }, ref) => {
    return (
      <MuiLink
        ref={ref}
        href={disabled ? undefined : href}
        underline="none"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: '0.875rem',
          fontWeight: active ? 600 : 500,
          color: active ? 'primary.main' : 'text.primary',
          bgcolor: active ? 'action.selected' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color 0.2s, color 0.2s',
          '&:hover': disabled
            ? {}
            : {
                bgcolor: active ? 'action.selected' : 'action.hover',
                color: active ? 'primary.main' : 'text.primary',
              },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
          ...sx,
        }}
        {...props}
      >
        {icon && (
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.25rem',
              color: active ? 'primary.main' : 'text.secondary',
            }}
          >
            {icon}
          </Box>
        )}
        {children}
      </MuiLink>
    )
  }
)

NavLink.displayName = 'NavLink'

export { NavLink }
