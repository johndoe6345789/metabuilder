import React from 'react'

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export const Backdrop: React.FC<BackdropProps> = ({ children, open, onClick, className = '', ...props }) =>
  open ? (
    <div className={`backdrop ${className}`} onClick={onClick} {...props}>
      {children}
    </div>
  ) : null
