import React from 'react'

export interface SnackbarAnchorOrigin {
  vertical?: 'top' | 'bottom'
  horizontal?: 'left' | 'center' | 'right'
}

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  anchorOrigin?: SnackbarAnchorOrigin
}

export const Snackbar: React.FC<SnackbarProps> = ({ children, open, anchorOrigin, className = '', ...props }) =>
  open ? (
    <div
      className={`snackbar ${anchorOrigin?.vertical ? `snackbar--${anchorOrigin.vertical}` : ''} ${anchorOrigin?.horizontal ? `snackbar--${anchorOrigin.horizontal}` : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  ) : null
