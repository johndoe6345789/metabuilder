import React, { forwardRef } from 'react'

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode
  dense?: boolean
  spaced?: boolean
}

export const List: React.FC<ListProps> = ({ children, dense, spaced, className = '', ...props }) => (
  <ul className={`list ${dense ? 'list--dense' : ''} ${spaced ? 'list--spaced' : ''} ${className}`} {...props}>
    {children}
  </ul>
)

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
  borderless?: boolean
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  clickable,
  selected,
  disabled,
  borderless,
  className = '',
  ...props
}) => (
  <li
    className={`list-item ${clickable ? 'list-item--clickable' : ''} ${selected ? 'list-item--selected' : ''} ${disabled ? 'list-item--disabled' : ''} ${borderless ? 'list-item--borderless' : ''} ${className}`}
    {...props}
  >
    {children}
  </li>
)

export interface ListItemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  selected?: boolean
}

export const ListItemButton = forwardRef<HTMLButtonElement, ListItemButtonProps>(
  ({ children, selected, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`list-item-button ${selected ? 'list-item-button--selected' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
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
