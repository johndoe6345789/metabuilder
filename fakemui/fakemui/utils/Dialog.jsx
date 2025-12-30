import React from 'react'

export const DialogOverlay = ({ children, onClick, className = '', ...props }) => (
  <div className={`dialog-overlay ${className}`} onClick={onClick} {...props}>{children}</div>
)

export const DialogPanel = ({ children, sm, lg, xl, className = '', ...props }) => (
  <div className={`dialog-panel ${sm ? 'dialog-panel--sm' : ''} ${lg ? 'dialog-panel--lg' : ''} ${xl ? 'dialog-panel--xl' : ''} ${className}`} onClick={e => e.stopPropagation()} {...props}>{children}</div>
)

export const DialogHeader = ({ children, className = '', ...props }) => (
  <div className={`dialog-header ${className}`} {...props}>{children}</div>
)

export const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 className={`dialog-title ${className}`} {...props}>{children}</h2>
)

export const DialogContent = ({ children, dividers, className = '', ...props }) => (
  <div className={`dialog-content ${dividers ? 'dialog-content--dividers' : ''} ${className}`} {...props}>{children}</div>
)

export const DialogActions = ({ children, className = '', ...props }) => (
  <div className={`dialog-footer ${className}`} {...props}>{children}</div>
)
