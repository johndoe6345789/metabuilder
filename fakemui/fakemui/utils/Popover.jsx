import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export const Popover = ({ children, open, anchorEl, onClose, anchorOrigin, transformOrigin, className = '', ...props }) => (
  open ? (
    <>
      <Backdrop open onClick={onClose} className="backdrop--transparent" />
      <div className={`popover ${className}`} {...props}>{children}</div>
    </>
  ) : null
)
