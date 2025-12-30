'use client'

import { ExpandLess, ExpandMore } from '@/fakemui/icons'
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { forwardRef, ReactNode, useState } from 'react'

interface SidebarItem {
  label: string
  icon?: ReactNode
  href?: string
  onClick?: () => void
  children?: SidebarItem[]
  badge?: ReactNode
  disabled?: boolean
}

interface MenuItemListProps {
  items: SidebarItem[]
  dense?: boolean
}

const MenuItemList = forwardRef<HTMLUListElement, MenuItemListProps>(
  ({ items, dense = false, ...props }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set())

    const toggleItem = (label: string) => {
      setOpenItems(prev => {
        const next = new Set(prev)
        if (next.has(label)) {
          next.delete(label)
        } else {
          next.add(label)
        }
        return next
      })
    }

    const renderItem = (item: SidebarItem, depth: number = 0) => {
      const hasChildren = item.children && item.children.length > 0
      const isOpen = openItems.has(item.label)

      return (
        <Box key={item.label}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  toggleItem(item.label)
                } else if (item.onClick) {
                  item.onClick()
                }
              }}
              disabled={item.disabled}
              sx={{
                pl: 2 + depth * 2,
                minHeight: dense ? 40 : 48,
              }}
            >
              {item.icon && <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: dense ? 'body2' : 'body1',
                  fontWeight: depth === 0 ? 500 : 400,
                }}
              />
              {item.badge && <Box sx={{ mr: 1 }}>{item.badge}</Box>}
              {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense={dense}>
                {item.children!.map(child => renderItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      )
    }

    return (
      <List ref={ref} dense={dense} {...props}>
        {items.map(item => renderItem(item))}
      </List>
    )
  }
)
MenuItemList.displayName = 'MenuItemList'

export { MenuItemList }
export type { MenuItemListProps, SidebarItem }
