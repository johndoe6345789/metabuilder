import React, { forwardRef } from 'react'

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: React.ReactNode
  value?: any
  onChange?: (event: React.SyntheticEvent, value: any) => void
  variant?: 'standard' | 'scrollable' | 'fullWidth'
}

export const Tabs: React.FC<TabsProps> = ({ children, value, onChange, variant, className = '', ...props }) => (
  <div className={`tabs ${variant ? `tabs--${variant}` : ''} ${className}`} role="tablist" {...props}>
    {children}
  </div>
)

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  label?: React.ReactNode
  icon?: React.ReactNode
  value?: any
  selected?: boolean
  disabled?: boolean
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ children, label, icon, value, selected, disabled, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`tab ${selected ? 'tab--active' : ''} ${disabled ? 'tab--disabled' : ''} ${className}`}
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="tab-icon">{icon}</span>}
      {label || children}
    </button>
  )
)

Tab.displayName = 'Tab'
