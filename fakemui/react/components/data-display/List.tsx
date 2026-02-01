import React, { forwardRef } from 'react'
import { sxToStyle } from '../utils/sx'

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
}

export const List: React.FC<ListProps> = ({
  children,
  dense,
  spaced,
  component: Component = 'ul',
  disablePadding,
  className = '',
  sx,
  style,
  ...props
}) => (
  <Component
    className={`list ${dense ? 'list--dense' : ''} ${spaced ? 'list--spaced' : ''} ${disablePadding ? 'list--no-padding' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </Component>
)

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
}) => (
  <li
    className={`list-item ${clickable ? 'list-item--clickable' : ''} ${selected ? 'list-item--selected' : ''} ${disabled ? 'list-item--disabled' : ''} ${borderless ? 'list-item--borderless' : ''} ${disablePadding ? 'list-item--no-padding' : ''} ${disableGutters ? 'list-item--no-gutters' : ''} ${className}`}
    style={{ ...sxToStyle(sx), ...style }}
    {...props}
  >
    {children}
  </li>
)

export interface ListItemButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode
  selected?: boolean
  /** Render as different element */
  component?: React.ElementType
  /** MUI sx prop */
  sx?: Record<string, unknown>
}

export const ListItemButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, ListItemButtonProps>(
  ({ children, selected, component, href, className = '', sx, style, ...props }, ref) => {
    // If href is provided, render as anchor, otherwise render as button (or custom component)
    const Component = component || (href ? 'a' : 'button')
    const elementProps = href ? { href, ...props } : props

    return (
      <Component
        ref={ref}
        className={`list-item-button ${selected ? 'list-item-button--selected' : ''} ${className}`}
        style={{ ...sxToStyle(sx), ...style }}
        {...elementProps}
      >
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
  <span className={`list-item-icon ${className}`} {...props}>
    {children}
  </span>
)

export interface ListItemTextProps extends React.HTMLAttributes<HTMLDivElement> {
  primary?: React.ReactNode
  secondary?: React.ReactNode
}

export const ListItemText: React.FC<ListItemTextProps> = ({ primary, secondary, className = '', ...props }) => (
  <div className={`list-item-text ${className}`} {...props}>
    {primary && <span className="list-item-title">{primary}</span>}
    {secondary && <span className="list-item-meta">{secondary}</span>}
  </div>
)

export interface ListItemAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const ListItemAvatar: React.FC<ListItemAvatarProps> = ({ children, className = '', ...props }) => (
  <div className={`list-item-avatar ${className}`} {...props}>
    {children}
  </div>
)

export interface ListSubheaderProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
}

export const ListSubheader: React.FC<ListSubheaderProps> = ({ children, className = '', ...props }) => (
  <li className={`list-subheader ${className}`} {...props}>
    {children}
  </li>
)
