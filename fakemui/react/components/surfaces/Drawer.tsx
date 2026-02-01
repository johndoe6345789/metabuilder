import React from 'react'
import { Backdrop } from '../feedback/Backdrop'
import { sxToStyle } from '../utils/sx'

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom'
export type DrawerVariant = 'permanent' | 'persistent' | 'temporary'

export interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  open?: boolean
  anchor?: DrawerAnchor
  variant?: DrawerVariant
  onClose?: () => void
  /** MUI sx prop */
  sx?: Record<string, unknown>
  /** Slot props for paper component */
  PaperProps?: React.HTMLAttributes<HTMLDivElement> & { sx?: Record<string, unknown> }
}

export const Drawer: React.FC<DrawerProps> = ({
  children,
  open,
  anchor = 'left',
  variant = 'temporary',
  onClose,
  className = '',
  sx,
  style,
  PaperProps,
  ...props
}) => (
  <>
    {variant === 'temporary' && open && <Backdrop open onClick={onClose} />}
    <aside
      className={`drawer drawer--${anchor} drawer--${variant} ${open ? 'drawer--open' : ''} ${className}`}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      {children}
    </aside>
  </>
)
