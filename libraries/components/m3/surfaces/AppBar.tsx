import React from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/appBar.module.scss'

export type AppBarPosition = 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  position?: AppBarPosition
  color?: string
  sx?: Record<string, unknown>
  /** Test ID for automated testing */
  testId?: string
}

export const AppBar: React.FC<AppBarProps> = ({ children, position = 'fixed', color, className = '', sx, style, testId, ...props }) => (
  <header
    className={[
      'app-bar',
      styles.appBar,
      `app-bar--${position}`,
      position === 'fixed' ? styles.appBarFixed : '',
      position === 'absolute' ? styles.appBarAbsolute : '',
      position === 'sticky' ? styles.appBarSticky : '',
      position === 'static' || position === 'relative' ? styles.appBarStatic : '',
      color ? `app-bar--${color}` : '',
      color === 'primary' ? styles.appBarPrimary : '',
      color === 'transparent' ? styles.appBarTransparent : '',
      className,
    ].filter(Boolean).join(' ')}
    style={{ ...sxToStyle(sx), ...style }}
    role="banner"
    data-testid={testId}
    {...props}
  >
    {children}
  </header>
)

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dense?: boolean
  disableGutters?: boolean
  variant?: 'regular' | 'dense'
  sx?: Record<string, unknown>
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, dense, disableGutters, variant, className = '', sx, style, ...props }) => (
  <div
    className={[
      'toolbar',
      styles.appBarToolbar,
      dense || variant === 'dense' ? `toolbar--dense ${styles.appBarToolbarDense}` : '',
      disableGutters ? 'toolbar--no-gutters' : '',
      className,
    ].filter(Boolean).join(' ')}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </div>
)
