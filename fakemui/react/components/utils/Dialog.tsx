import React from 'react'

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({ children, onClick, className = '', ...props }) => (
  <div className={`dialog-overlay ${className}`} onClick={onClick} {...props}>
    {children}
  </div>
)

export interface DialogPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  sm?: boolean
  lg?: boolean
  xl?: boolean
}

export const DialogPanel: React.FC<DialogPanelProps> = ({ children, sm, lg, xl, className = '', ...props }) => (
  <div
    className={`dialog-panel ${sm ? 'dialog-panel--sm' : ''} ${lg ? 'dialog-panel--lg' : ''} ${xl ? 'dialog-panel--xl' : ''} ${className}`}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
)

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '', ...props }) => (
  <div className={`dialog-header ${className}`} {...props}>
    {children}
  </div>
)

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '', ...props }) => (
  <h2 className={`dialog-title ${className}`} {...props}>
    {children}
  </h2>
)

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dividers?: boolean
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, dividers, className = '', ...props }) => (
  <div className={`dialog-content ${dividers ? 'dialog-content--dividers' : ''} ${className}`} {...props}>
    {children}
  </div>
)

export interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const DialogActions: React.FC<DialogActionsProps> = ({ children, className = '', ...props }) => (
  <div className={`dialog-footer ${className}`} {...props}>
    {children}
  </div>
)
