import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom'
export type DrawerVariant = 'permanent' | 'persistent' | 'temporary'

export interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  open?: boolean
  anchor?: DrawerAnchor
  variant?: DrawerVariant
  onClose?: () => void
}

export const Drawer: React.FC<DrawerProps> = ({
  children,
  open,
  anchor = 'left',
  variant = 'temporary',
  onClose,
  className = '',
  ...props
}) => (
  <>
    {variant === 'temporary' && open && <Backdrop open onClick={onClose} />}
    <aside
      className={`drawer drawer--${anchor} drawer--${variant} ${open ? 'drawer--open' : ''} ${className}`}
      {...props}
    >
      {children}
    </aside>
  </>
)
