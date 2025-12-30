import React, { forwardRef } from 'react'
import { Backdrop } from '../feedback/Backdrop'

export const Menu = ({ children, open, anchorEl, onClose, className = '', ...props }) => (
  open ? (
    <>
      <Backdrop open onClick={onClose} className="backdrop--transparent" />
      <div className={`menu ${className}`} {...props}>{children}</div>
    </>
  ) : null
)

export const MenuItem = forwardRef(({ children, selected, disabled, className = '', ...props }, ref) => (
  <button ref={ref} className={`menu-item ${selected ? 'menu-item--selected' : ''} ${disabled ? 'menu-item--disabled' : ''} ${className}`} disabled={disabled} {...props}>{children}</button>
))

export const MenuList = ({ children, className = '', ...props }) => (
  <div className={`menu-list ${className}`} role="menu" {...props}>{children}</div>
)
