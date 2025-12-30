import React from 'react'

export const Backdrop = ({ children, open, onClick, className = '', ...props }) => (
  open ? <div className={`backdrop ${className}`} onClick={onClick} {...props}>{children}</div> : null
)
