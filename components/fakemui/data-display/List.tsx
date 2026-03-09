import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/mat-list.module.scss'

/** Resolve a class name through CSS Modules; falls back to the raw key if not found */
const s = (key: string): string => styles[key] || key

export interface ListProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  dense?: boolean
  spaced?: boolean
  /** Render as different element (nav, div, etc.) */
  component?: React.ElementType
  /** Disable padding */
  disablePadding?: boolean
  /** MUI sx prop */
  sx?: Record<string, unknown>
  /** Test ID for automated testing */
  testId?: string
}

export const List: React.FC<ListProps> = ({
  children,
  dense,
  spaced,
  component: Component = 'ul',
  disablePadding,
  testId,
  className = '',
  sx,
  style,
  ...props
}) => {
  const classNames = [
    s('matList'),
    s('mdc-list'),
    s('mat-mdc-list-base'),
    dense ? s('dense') : '',
    spaced ? s('spaced') : '',
    disablePadding ? s('noPadding') : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <Component
      className={classNames}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      role={Component !== 'ul' && Component !== 'ol' ? 'list' : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
  borderless?: boolean
  /** Disable padding (MUI-style) */
  disablePadding?: boolean
  /** Disable gutters (MUI-style) */
  disableGutters?: boolean
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  clickable,
  selected,
  disabled,
  borderless,
  disablePadding,
  disableGutters,
  className = '',
  sx,
  style,
  ...props
}) => {
  const classNames = [
    s('mdc-list-item'),
    s('mat-mdc-list-item'),
    s('mdc-list-item--with-one-line'),
    clickable ? s('mat-mdc-list-item-interactive') : '',
    selected ? s('mdc-list-item--selected') : '',
    disabled ? s('mdc-list-item--disabled') : '',
    borderless ? s('borderless') : '',
    disablePadding ? s('noPadding') : '',
    disableGutters ? s('noGutters') : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <li
      className={classNames}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      <span className={s('mat-focus-indicator')} />
      {children}
    </li>
  )
}

export interface ListItemButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
  selected?: boolean
  disabled?: boolean
  /** Render as different element */
  component?: React.ElementType
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const ListItemButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, ListItemButtonProps>(
  ({ children, selected, disabled, component, href, className = '', sx, style, ...props }, ref) => {
    // If href is provided, render as anchor, otherwise render as button (or custom component)
    const Component = component || (href ? 'a' : 'button')
    const elementProps = href ? { href, ...props } : props

    const classNames = [
      s('mdc-list-item'),
      s('mat-mdc-list-item'),
      s('mat-mdc-list-item-interactive'),
      s('mdc-list-item--with-one-line'),
      selected ? `${s('mdc-list-item--selected')} ${s('mdc-list-item--activated')}` : '',
      disabled ? s('mdc-list-item--disabled') : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <Component
        ref={ref}
        className={classNames}
        style={{ ...sxToStyle(sx), ...style }}
        {...elementProps}
      >
        <span className={s('mat-focus-indicator')} />
        {children}
      </Component>
    )
  }
)

ListItemButton.displayName = 'ListItemButton'

export interface ListItemIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export const ListItemIcon: React.FC<ListItemIconProps> = ({ children, className = '', ...props }) => (
  <span className={`${s('mdc-list-item__start')} ${s('mat-mdc-list-item-icon')} ${className}`.trim()} {...props}>
    {children}
  </span>
)

export interface ListItemTextProps extends React.HTMLAttributes<HTMLDivElement> {
  primary?: React.ReactNode
  secondary?: React.ReactNode
}

export const ListItemText: React.FC<ListItemTextProps> = ({ primary, secondary, className = '', ...props }) => (
  <div className={`${s('mdc-list-item__content')} ${className}`.trim()} {...props}>
    {primary && <span className={s('mdc-list-item__primary-text')}>{primary}</span>}
    {secondary && <span className={`${s('mdc-list-item__secondary-text')} ${s('mat-mdc-list-item-line')}`}>{secondary}</span>}
  </div>
)

export interface ListItemAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const ListItemAvatar: React.FC<ListItemAvatarProps> = ({ children, className = '', ...props }) => (
  <div className={`${s('mdc-list-item__start')} ${s('mat-mdc-list-item-avatar')} ${className}`.trim()} {...props}>
    {children}
  </div>
)

export interface ListSubheaderProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
}

export const ListSubheader: React.FC<ListSubheaderProps> = ({ children, className = '', ...props }) => (
  <li className={`${s('mdc-list-group__subheader')} ${className}`.trim()} {...props}>
    {children}
  </li>
)
