'use client'

import { Badge, Box,ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

export interface NavItemProps {
  icon?: ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  badge?: number | string
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  href?: string
  secondaryLabel?: string
  dense?: boolean
  className?: string
}

const NavItem = forwardRef<HTMLLIElement, NavItemProps>(
  (
    {
      icon,
      label,
      onClick,
      active = false,
      disabled = false,
      badge,
      badgeColor = 'primary',
      href,
      secondaryLabel,
      dense = false,
      ...props
    },
    ref
  ) => {
    return (
      <ListItem
        ref={ref}
        disablePadding
        {...props}
        sx={{
          ...(props as any).sx,
        }}
      >
        <ListItemButton
          onClick={onClick}
          disabled={disabled}
          selected={active}
          dense={dense}
          href={href}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            my: 0.25,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {icon && (
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              {badge !== undefined ? (
                <Badge
                  badgeContent={badge}
                  color={badgeColor}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.625rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px',
                    },
                  }}
                >
                  {icon}
                </Badge>
              ) : (
                icon
              )}
            </ListItemIcon>
          )}
          <ListItemText
            primary={label}
            secondary={secondaryLabel}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: active ? 600 : 400,
              color: active ? 'primary.main' : 'text.primary',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
            }}
          />
          {badge !== undefined && !icon && (
            <Box sx={{ ml: 1 }}>
              <Badge
                badgeContent={badge}
                color={badgeColor}
                sx={{
                  '& .MuiBadge-badge': {
                    position: 'static',
                    transform: 'none',
                  },
                }}
              />
            </Box>
          )}
        </ListItemButton>
      </ListItem>
    )
  }
)

NavItem.displayName = 'NavItem'

export { NavItem }
