import React from 'react'
import { Backdrop } from '../feedback/Backdrop'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/mat-drawer.module.scss'

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
  /** Test ID for automated testing */
  testId?: string
}

/** Map anchor prop to CSS module class */
const anchorClassMap: Record<DrawerAnchor, string | undefined> = {
  left: styles.drawerLeft,
  right: styles.drawerRight,
  top: undefined,
  bottom: undefined,
}

/** Map variant prop to CSS module class */
const variantClassMap: Record<DrawerVariant, string> = {
  permanent: styles.drawerPermanent,
  persistent: styles.drawerPersistent,
  temporary: styles.drawerTemporary,
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
  testId,
  ...props
}) => {
  const classNames = [
    styles.drawer,
    anchorClassMap[anchor],
    variantClassMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // For temporary drawers, only render when open (or use visibility/transform for animations)
  const shouldRender = variant !== 'temporary' || open

  return (
    <>
      {variant === 'temporary' && open && <Backdrop open onClick={onClose} />}
      {shouldRender && (
        <aside
          className={classNames}
          style={{ ...sxToStyle(sx), ...style }}
          role="complementary"
          data-testid={testId}
          {...props}
        >
          {children}
        </aside>
      )}
    </>
  )
}
