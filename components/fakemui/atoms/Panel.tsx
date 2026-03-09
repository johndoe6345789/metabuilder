import React from 'react'
import classNames from 'classnames'
import styles from '../../../scss/atoms/panel.module.scss'

// ============================================================================
// Panel Component - Material Design 3
// ============================================================================

export type PanelVariant = 'default' | 'elevated' | 'outlined'
export type PanelFixedPosition = 'br' | 'bl' | 'tr' | 'tl'
export type PanelHeaderVariant = 'primary' | 'secondary' | 'tertiary' | 'surface'

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Panel visual style */
  variant?: PanelVariant
  /** Fixed position on screen */
  fixedPosition?: PanelFixedPosition
  /** Enable collapsible behavior */
  collapsible?: boolean
  /** Collapsed state (requires collapsible=true) */
  collapsed?: boolean
  /** Test ID for automated testing */
  testId?: string
}

export const Panel: React.FC<PanelProps> = ({
  children,
  className,
  variant = 'default',
  fixedPosition,
  collapsible = false,
  collapsed = false,
  testId,
  ...props
}) => {
  const panelClass = classNames(
    // Base or variant class
    {
      [styles.panel]: variant === 'default' && !fixedPosition,
      [styles.panelElevated]: variant === 'elevated',
      [styles.panelOutlined]: variant === 'outlined',
    },
    // Fixed position classes
    {
      [styles.panelFixedBr]: fixedPosition === 'br',
      [styles.panelFixedBl]: fixedPosition === 'bl',
      [styles.panelFixedTr]: fixedPosition === 'tr',
      [styles.panelFixedTl]: fixedPosition === 'tl',
    },
    // Collapsible state classes
    {
      [styles.panelCollapsible]: collapsible,
      [styles.panelCollapsed]: collapsible && collapsed,
    },
    className
  )

  return (
    <div className={panelClass} data-testid={testId} role="region" {...props}>
      {children}
    </div>
  )
}

// ============================================================================
// PanelHeader Component
// ============================================================================

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Header color variant */
  variant?: PanelHeaderVariant
  /** Make header clickable (for collapsible panels) */
  clickable?: boolean
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  children,
  className,
  variant = 'primary',
  clickable = false,
  ...props
}) => {
  const headerClass = classNames(
    {
      [styles.panelHeader]: variant === 'primary',
      [styles.panelHeaderSecondary]: variant === 'secondary',
      [styles.panelHeaderTertiary]: variant === 'tertiary',
      [styles.panelHeaderSurface]: variant === 'surface',
      [styles.panelHeaderClickable]: clickable,
    },
    className
  )

  return (
    <div className={headerClass} {...props}>
      {children}
    </div>
  )
}

// ============================================================================
// PanelTitle Component
// ============================================================================

export interface PanelTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  /** Heading level for accessibility */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const PanelTitle: React.FC<PanelTitleProps> = ({
  children,
  className,
  as: Component = 'h3',
  ...props
}) => {
  return (
    <Component className={classNames(styles.panelTitle, className)} {...props}>
      {children}
    </Component>
  )
}

// ============================================================================
// PanelBody Component
// ============================================================================

export type PanelBodyVariant = 'default' | 'noPadding' | 'scroll'

export interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Body padding/scroll variant */
  variant?: PanelBodyVariant
}

export const PanelBody: React.FC<PanelBodyProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const bodyClass = classNames(
    {
      [styles.panelBody]: variant === 'default',
      [styles.panelBodyNoPadding]: variant === 'noPadding',
      [styles.panelBodyScroll]: variant === 'scroll',
    },
    className
  )

  return (
    <div className={bodyClass} {...props}>
      {children}
    </div>
  )
}

// ============================================================================
// PanelFooter Component
// ============================================================================

export interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Show action buttons aligned right */
  actions?: boolean
}

export const PanelFooter: React.FC<PanelFooterProps> = ({
  children,
  className,
  actions = false,
  ...props
}) => {
  const footerClass = classNames(
    actions ? styles.panelFooterActions : styles.panelFooter,
    className
  )

  return (
    <div className={footerClass} {...props}>
      {children}
    </div>
  )
}

// ============================================================================
// PanelSection Component
// ============================================================================

export interface PanelSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const PanelSection: React.FC<PanelSectionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={classNames(styles.panelSection, className)} {...props}>
      {children}
    </div>
  )
}
