'use client'

import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

import { DropdownMenuItem } from '../DropdownMenu'

type DropdownMenuItemComponentProps = ComponentPropsWithoutRef<typeof DropdownMenuItem>

interface MenuItemProps extends DropdownMenuItemComponentProps {
  description?: ReactNode
  detail?: ReactNode
}

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  ({ children, description, detail, ...props }, ref) => {
    return (
      <DropdownMenuItem ref={ref} {...props}>
        <Box
          sx={{
            display: 'flex',
            alignItems: description ? 'flex-start' : 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{children}</Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
          {detail && (
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {detail}
            </Box>
          )}
        </Box>
      </DropdownMenuItem>
    )
  }
)
MenuItem.displayName = 'MenuItem'

export type { MenuItemProps }
export { MenuItem }
