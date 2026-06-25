import React, { forwardRef } from 'react'

export interface BottomNavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  children?: React.ReactNode
  value?: any
  onChange?: (event: React.SyntheticEvent, value: any) => void
  /** Test ID for automated testing */
  testId?: string
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ children, value, onChange, className = '', testId, ...props }) => (
  <nav className={`bottom-nav ${className}`} role="navigation" data-testid={testId} {...props}>
    {children}
  </nav>
)

export interface BottomNavigationActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode
  icon?: React.ReactNode
  value?: any
  selected?: boolean
}

export const BottomNavigationAction = forwardRef<HTMLButtonElement, BottomNavigationActionProps>(
  ({ label, icon, value, selected, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`bottom-nav-action ${selected ? 'bottom-nav-action--selected' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="bottom-nav-icon">{icon}</span>}
      {label && <span className="bottom-nav-label">{label}</span>}
    </button>
  )
)

BottomNavigationAction.displayName = 'BottomNavigationAction'
