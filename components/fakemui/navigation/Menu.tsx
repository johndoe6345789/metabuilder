import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import { Backdrop } from '../feedback/Backdrop'
import styles from '../../../scss/atoms/mat-menu.module.scss'

const s = (key: string): string => styles[key] || key

const EDGE_GAP = 8
const ANCHOR_GAP = 4

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  anchorEl?: HTMLElement | null
  onClose?: () => void
  /** Menu appears from right side */
  anchorRight?: boolean
  /** Menu appears from bottom */
  anchorBottom?: boolean
  /** Dense variant with smaller items */
  dense?: boolean
  /** Lay items out in multiple columns (max-height in px before wrapping to next column) */
  multiColumn?: boolean
  /** Max height per column when multiColumn is true (default 80vh) */
  columnHeight?: number
  /** Test identifier */
  testId?: string
}

export const Menu: React.FC<MenuProps> = ({
  children,
  open,
  anchorEl,
  onClose,
  anchorRight,
  anchorBottom,
  dense,
  multiColumn,
  columnHeight,
  testId,
  className,
  style,
  ...props
}) => {
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<React.CSSProperties>({ position: 'fixed', visibility: 'hidden' })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Arrow key navigation between menu items (WAI-ARIA menu pattern)
  useEffect(() => {
    if (!open) return
    const el = menuRef.current
    if (!el) return

    const items = () => Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'))
    const firstItem = items()[0]
    if (firstItem) firstItem.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      const menuItems = items()
      const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          menuItems[(currentIndex + 1) % menuItems.length]?.focus()
          break
        case 'ArrowUp':
          e.preventDefault()
          menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length]?.focus()
          break
        case 'Home':
          e.preventDefault()
          menuItems[0]?.focus()
          break
        case 'End':
          e.preventDefault()
          menuItems[menuItems.length - 1]?.focus()
          break
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Clamp position within viewport after render (runs before paint — no flicker)
  useLayoutEffect(() => {
    if (!open || !mounted) return
    const el = menuRef.current
    if (!el) return

    const rect = anchorEl?.getBoundingClientRect()
    const menuRect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Vertical: open below anchor, flip above if it would overflow
    let top = rect ? rect.bottom + ANCHOR_GAP : EDGE_GAP
    if (top + menuRect.height > vh - EDGE_GAP) {
      const flippedTop = rect ? rect.top - menuRect.height - ANCHOR_GAP : EDGE_GAP
      top = flippedTop >= EDGE_GAP ? flippedTop : Math.max(EDGE_GAP, vh - menuRect.height - EDGE_GAP)
    }

    // Horizontal
    let left: number | undefined
    let right: number | undefined
    if (anchorRight) {
      right = rect ? window.innerWidth - rect.right : EDGE_GAP
      // Clamp: prevent going off the left edge
      if (right + menuRect.width > vw - EDGE_GAP) {
        right = Math.max(EDGE_GAP, vw - menuRect.width - EDGE_GAP)
      }
    } else {
      left = rect ? rect.left : EDGE_GAP
      // Clamp: prevent going off the right edge
      if (left + menuRect.width > vw - EDGE_GAP) {
        left = Math.max(EDGE_GAP, vw - menuRect.width - EDGE_GAP)
      }
    }

    setPosition({
      position: 'fixed',
      top,
      ...(anchorRight ? { right } : { left }),
      visibility: 'visible',
    })
  }, [open, mounted, anchorEl, anchorRight])

  if (!open || !mounted) return null

  return createPortal(
    <>
      <Backdrop open invisible onClick={onClose} />
      <div
        ref={menuRef}
        className={classNames(
          s('mat-mdc-menu-panel'),
          styles.matMenu,
          {
            [styles.menuRight]: anchorRight,
            [styles.menuBottom]: anchorBottom,
            [styles.menuDense]: dense,
            [styles.menuMultiColumn]: multiColumn,
          },
          className
        )}
        role="menu"
        data-testid={testId}
        style={{
          ...position,
          ...(multiColumn ? {
            maxWidth: 'none',
            overflow: 'auto',
            maxHeight: `${Math.round(window.innerHeight * 0.9)}px`,
          } : {}),
          ...style,
        }}
        {...props}
      >
        <div
          className={s('mat-mdc-menu-content')}
          style={multiColumn ? {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            maxHeight: `${columnHeight ?? Math.round(window.innerHeight * 0.8)}px`,
          } : undefined}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  selected?: boolean
  disabled?: boolean
  /** Value for Select component integration */
  value?: string | number
  /** Leading icon element */
  icon?: React.ReactNode
  /** Keyboard shortcut text */
  shortcut?: string
  /** Trailing element */
  trailing?: React.ReactNode
  /** Test identifier */
  testId?: string
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ children, selected, disabled, value, icon, shortcut, trailing, testId, className, ...props }, ref) => (
    <button
      ref={ref}
      className={classNames(
        s('mat-mdc-menu-item'),
        {
          [s('mat-mdc-menu-item-highlighted')]: selected,
        },
        className
      )}
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      data-testid={testId}
      data-value={value}
      {...props}
    >
      {icon && <span className={classNames(s('mat-icon'), styles.menuItemIcon)}>{icon}</span>}
      <span className={classNames(s('mat-mdc-menu-item-text'), styles.menuItemText)}>{children}</span>
      {shortcut && <span className={styles.menuItemShortcut}>{shortcut}</span>}
      {trailing && <span className={styles.menuItemTrailing}>{trailing}</span>}
    </button>
  )
)

MenuItem.displayName = 'MenuItem'

export interface MenuListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const MenuList: React.FC<MenuListProps> = ({ children, className, ...props }) => (
  <div className={classNames(s('mat-mdc-menu-content'), className)} role="menu" {...props}>
    {children}
  </div>
)

export interface MenuDividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MenuDivider: React.FC<MenuDividerProps> = ({ className, ...props }) => (
  <div className={classNames(s('mat-divider'), styles.menuDivider, className)} role="separator" {...props} />
)

export interface MenuSubheaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const MenuSubheader: React.FC<MenuSubheaderProps> = ({ children, className, ...props }) => (
  <div className={classNames(styles.menuSubheader, className)} {...props}>
    {children}
  </div>
)
