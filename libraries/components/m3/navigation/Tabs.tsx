import React, { forwardRef } from 'react'
import styles from '../../../scss/atoms/mat-tabs.module.scss'

const s = (key: string): string => styles[key] || key

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: React.ReactNode
  value?: any
  onChange?: (event: React.SyntheticEvent, value: any) => void
  /** Simpler value-change callback (no SyntheticEvent). Used by JSON UI bindings. */
  onValueChange?: (value: any) => void
  variant?: 'standard' | 'scrollable' | 'fullWidth' | 'secondary' | 'centered'
  fullWidth?: boolean
  testId?: string
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, value, onChange, onValueChange, variant, fullWidth, testId, className = '', ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const tabs = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')
      )
      const currentIndex = tabs.indexOf(e.target as HTMLElement)
      if (currentIndex === -1) return

      let nextIndex: number | null = null
      switch (e.key) {
        case 'ArrowRight': nextIndex = (currentIndex + 1) % tabs.length; break
        case 'ArrowLeft': nextIndex = (currentIndex - 1 + tabs.length) % tabs.length; break
        case 'Home': nextIndex = 0; break
        case 'End': nextIndex = tabs.length - 1; break
      }
      if (nextIndex !== null) {
        e.preventDefault()
        tabs[nextIndex]?.focus()
        tabs[nextIndex]?.click()
      }
    }

    const variantClasses = [
      variant === 'secondary' && styles.secondary,
      variant === 'scrollable' && styles.scrollable,
      variant === 'centered' && styles.centered,
      (variant === 'fullWidth' || fullWidth) && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        ref={ref}
        className={`${s('mat-mdc-tab-group')} ${styles.matTabs} ${variantClasses} ${className}`.trim()}
        role="tablist"
        data-testid={testId}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className={s('mat-mdc-tab-header')}>
          <div className={s('mat-mdc-tab-label-container')}>
            <div className={s('mat-mdc-tab-list')}>
              <div className={s('mat-mdc-tab-labels')}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  label?: React.ReactNode
  icon?: React.ReactNode
  value?: any
  selected?: boolean
  disabled?: boolean
  testId?: string
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ children, label, icon, value, selected, disabled, testId, className = '', ...props }, ref) => {
    const hasIcon = Boolean(icon)
    const tabClasses = [
      s('mdc-tab'),
      s('mat-mdc-tab'),
      hasIcon && styles.tabWithIcon,
      selected && s('mdc-tab--active'),
      disabled && s('mat-mdc-tab-disabled'),
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={tabClasses}
        role="tab"
        aria-selected={selected}
        aria-disabled={disabled}
        disabled={disabled}
        tabIndex={selected ? 0 : -1}
        data-testid={testId}
        {...props}
      >
        <span className={`${s('mdc-tab__ripple')} ${s('mat-mdc-tab-ripple')}`} />
        <span className={s('mdc-tab__content')}>
          {icon && <span className={styles.tabIcon}>{icon}</span>}
          <span className={s('mdc-tab__text-label')}>{label || children}</span>
        </span>
        <span className={s('mdc-tab-indicator')}>
          <span className={`${s('mdc-tab-indicator__content')} ${s('mdc-tab-indicator__content--underline')} ${selected ? s('mdc-tab-indicator--active') : ''}`} />
        </span>
      </button>
    )
  }
)

Tab.displayName = 'Tab'

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  value?: any
  index?: number | string
  hidden?: boolean
  testId?: string
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ children, value, index, hidden, testId, className = '', ...props }, ref) => {
    const isHidden = hidden ?? (value !== undefined && index !== undefined && value !== index)

    if (isHidden) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`${s('mat-mdc-tab-body')} ${styles.tabPanel} ${className}`.trim()}
        role="tabpanel"
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabPanel.displayName = 'TabPanel'
