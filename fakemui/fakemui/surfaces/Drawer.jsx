import React from 'react'
import { Backdrop } from '../feedback/Backdrop'

export const Drawer = ({ children, open, anchor = 'left', variant = 'temporary', onClose, className = '', ...props }) => (
  <>
    {variant === 'temporary' && open && <Backdrop open onClick={onClose} />}
    <aside className={`drawer drawer--${anchor} drawer--${variant} ${open ? 'drawer--open' : ''} ${className}`} {...props}>{children}</aside>
  </>
)
