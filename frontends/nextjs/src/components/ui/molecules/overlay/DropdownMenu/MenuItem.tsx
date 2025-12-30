'use client'

import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'

import { Typography } from '@/fakemui/fakemui/data-display'

import { DropdownMenuItem } from '../DropdownMenu'
import styles from './MenuItem.module.scss'

type DropdownMenuItemComponentProps = ComponentPropsWithoutRef<typeof DropdownMenuItem>

interface MenuItemProps extends DropdownMenuItemComponentProps {
  description?: ReactNode
  detail?: ReactNode
}

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  ({ children, description, detail, ...props }, ref) => {
    return (
      <DropdownMenuItem ref={ref} {...props}>
        <div className={`${styles.container} ${description ? styles.hasDescription : ''}`}>
          <div className={styles.content}>
            <Typography variant="body2" className={styles.label}>{children}</Typography>
            {description && (
              <Typography variant="body2" className={styles.description}>
                {description}
              </Typography>
            )}
          </div>
          {detail && (
            <span className={styles.detail}>
              {detail}
            </span>
          )}
        </div>
      </DropdownMenuItem>
    )
  }
)
MenuItem.displayName = 'MenuItem'

export type { MenuItemProps }
export { MenuItem }
