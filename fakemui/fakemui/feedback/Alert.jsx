import React from 'react'

export const Alert = ({ children, title, severity = 'info', icon, action, variant = 'standard', onClose, className = '', ...props }) => (
  <div className={`alert alert--${severity} alert--${variant} ${className}`} role="alert" {...props}>
    {icon !== false && <span className="alert-icon">{icon || getDefaultIcon(severity)}</span>}
    <div className="alert-content">
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </div>
    {action && <div className="alert-action">{action}</div>}
    {onClose && (
      <button className="alert-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    )}
  </div>
)

export const AlertTitle = ({ children, className = '', ...props }) => (
  <div className={`alert-title ${className}`} {...props}>
    {children}
  </div>
)

function getDefaultIcon(severity) {
  switch (severity) {
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
    case 'success': return '✓'
    default: return 'ℹ'
  }
}
