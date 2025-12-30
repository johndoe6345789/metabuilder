'use client'

import { ExpandLess, ExpandMore } from '@/fakemui/icons'
import { Box, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@/fakemui'
import { forwardRef, ReactNode, useState } from 'react'
import styles from './Navigation.module.scss'

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
          <ListItem className={styles.menuItem}>
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  toggleItem(item.label)
                } else if (item.onClick) {
                  item.onClick()
                }
              }}
              disabled={item.disabled}
              className={`${styles.menuItemButton} ${dense ? styles.dense : ''}`}
              style={{ paddingLeft: `${16 + depth * 16}px` }}
            >
              {item.icon && <ListItemIcon className={styles.menuItemIcon}>{item.icon}</ListItemIcon>}
              <ListItemText
                primary={item.label}
                className={`${styles.menuItemText} ${depth > 0 ? styles.nested : ''}`}
              />
              {item.badge && <span className={styles.menuItemBadge}>{item.badge}</span>}
              {hasChildren && (
                <span className={styles.expandIcon}>
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </span>
              )}
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isOpen}>
              <List dense={dense} className={styles.nestedList}>
                {item.children!.map(child => renderItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      )
    }

    return (
      <List ref={ref} dense={dense} className={`${styles.menuList} ${dense ? styles.dense : ''}`} {...props}>
        {items.map(item => renderItem(item))}
      </List>
    )
  }
)
MenuItemList.displayName = 'MenuItemList'

export { MenuItemList }
export type { MenuItemListProps, SidebarItem }
