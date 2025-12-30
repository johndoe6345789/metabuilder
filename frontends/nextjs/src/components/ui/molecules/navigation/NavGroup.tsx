'use client'

import { Box, Collapse, Divider, List, ListItem, ListItemIcon, ListItemText } from '@/fakemui'
import { forwardRef, ReactNode, useState } from 'react'

import { ExpandLess, ExpandMore } from '@/fakemui/icons'

import styles from './NavGroup.module.scss'

export interface NavGroupProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  disabled?: boolean
  divider?: boolean
  className?: string
}

const NavGroup = forwardRef<HTMLDivElement, NavGroupProps>(
  (
    { label, icon, children, defaultOpen = false, disabled = false, divider = false, className = '', ...props },
    ref
  ) => {
    const [open, setOpen] = useState(defaultOpen)

    const handleToggle = () => {
      if (!disabled) {
        setOpen(prev => !prev)
      }
    }

    const buttonClasses = [styles.groupButton, disabled && styles.groupButtonDisabled]
      .filter(Boolean)
      .join(' ')

    const collapseClasses = [styles.collapse, open && styles.collapseOpen].filter(Boolean).join(' ')

    const childListClasses = [
      styles.childList,
      icon ? styles.childListWithIcon : styles.childListNoIcon,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Box ref={ref} className={`${styles.navGroup} ${className}`} {...props}>
        {divider && <Divider className={styles.divider} />}
        <ListItem className={styles.groupItem}>
          <button
            type="button"
            className={buttonClasses}
            onClick={handleToggle}
            disabled={disabled}
          >
            {icon && <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>}
            <ListItemText
              primary={<span className={styles.labelText}>{label}</span>}
            />
            <span className={styles.expandIcon}>
              {open ? (
                <ExpandLess size={16} />
              ) : (
                <ExpandMore size={16} />
              )}
            </span>
          </button>
        </ListItem>
        <Collapse in={open} className={collapseClasses}>
          <List className={childListClasses}>{children}</List>
        </Collapse>
      </Box>
    )
  }
)

NavGroup.displayName = 'NavGroup'

export { NavGroup }
