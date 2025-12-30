import React from 'react'

export const Snackbar = ({ children, open, anchorOrigin, className = '', ...props }) => (
  open ? <div className={`snackbar ${anchorOrigin?.vertical ? `snackbar--${anchorOrigin.vertical}` : ''} ${anchorOrigin?.horizontal ? `snackbar--${anchorOrigin.horizontal}` : ''} ${className}`} {...props}>{children}</div> : null
)
