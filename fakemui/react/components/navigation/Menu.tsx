import React, { forwardRef } from 'react'
import { Backdrop } from '../feedback/Backdrop'

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  anchorEl?: HTMLElement | null
  onClose?: () => void
}

export const Menu: React.FC<MenuProps> = ({ children, open, anchorEl, onClose, className = '', ...props }) =>
  open ? (
    <>
      <Backdrop open onClick={onClose} className="backdrop--transparent" />
      <div className={`menu ${className}`} {...props}>
        {children}
      </div>
    </>
  ) : null

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  selected?: boolean
  disabled?: boolean
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ children, selected, disabled, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`menu-item ${selected ? 'menu-item--selected' : ''} ${disabled ? 'menu-item--disabled' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
)

MenuItem.displayName = 'MenuItem'

export interface MenuListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const MenuList: React.FC<MenuListProps> = ({ children, className = '', ...props }) => (
  <div className={`menu-list ${className}`} role="menu" {...props}>
    {children}
  </div>
)
