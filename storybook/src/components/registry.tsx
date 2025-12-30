/**
 * Component Registry
 * Maps Lua component type names to React components
 */

import React, { type ComponentType, type ReactNode } from 'react'

export interface LuaComponentProps {
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

type AnyComponent = ComponentType<LuaComponentProps>

/**
 * Basic UI Components
 * These mirror the components available in the main app's fakemui library
 */

export const Box: React.FC<LuaComponentProps> = ({ className, children, ...props }) => (
  <div className={className} {...props}>{children}</div>
)

export const Stack: React.FC<LuaComponentProps> = ({ className = 'flex flex-col gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Flex: React.FC<LuaComponentProps> = ({ className = 'flex gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Grid: React.FC<LuaComponentProps> = ({ className = 'grid grid-cols-2 gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Container: React.FC<LuaComponentProps> = ({ className = 'max-w-7xl mx-auto px-4', children }) => (
  <div className={className}>{children}</div>
)

export const Card: React.FC<LuaComponentProps> = ({ className = 'rounded-lg border shadow-sm bg-canvas', children }) => (
  <div className={className}>{children}</div>
)

export const CardHeader: React.FC<LuaComponentProps> = ({ className = 'p-6 pb-2', children }) => (
  <div className={className}>{children}</div>
)

export const CardContent: React.FC<LuaComponentProps> = ({ className = 'p-6 pt-0', children }) => (
  <div className={className}>{children}</div>
)

export const CardActions: React.FC<LuaComponentProps> = ({ className = 'p-6 pt-0 flex gap-2', children }) => (
  <div className={className}>{children}</div>
)

export const Paper: React.FC<LuaComponentProps> = ({ className = 'rounded border p-4 bg-canvas', children }) => (
  <div className={className}>{children}</div>
)

interface TypographyProps extends LuaComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline'
  text?: string
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body1', 
  text, 
  className = '', 
  children 
}) => {
  const content = text ?? children
  const variantClasses: Record<string, string> = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs text-muted-foreground',
    overline: 'text-xs uppercase tracking-wide text-muted-foreground',
  }
  
  const combinedClass = `${variantClasses[variant]} ${className}`
  
  switch (variant) {
    case 'h1': return <h1 className={combinedClass}>{content}</h1>
    case 'h2': return <h2 className={combinedClass}>{content}</h2>
    case 'h3': return <h3 className={combinedClass}>{content}</h3>
    case 'h4': return <h4 className={combinedClass}>{content}</h4>
    case 'h5': return <h5 className={combinedClass}>{content}</h5>
    case 'h6': return <h6 className={combinedClass}>{content}</h6>
    default: return <p className={combinedClass}>{content}</p>
  }
}

interface ButtonProps extends LuaComponentProps {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'error'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'contained',
  color: _color = 'primary',
  size = 'medium',
  className = '',
  children,
  onClick,
}) => {
  const baseClass = 'rounded font-medium transition-colors cursor-pointer'
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  }
  const variantClasses = {
    contained: 'bg-accent text-accent-foreground hover:opacity-90',
    outlined: 'border border-accent text-accent hover:bg-accent/10',
    text: 'text-accent hover:bg-accent/10',
  }
  
  return (
    <button 
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      style={{ backgroundColor: variant === 'contained' ? 'var(--color-accent)' : undefined }}
    >
      {children}
    </button>
  )
}

interface IconProps extends LuaComponentProps {
  name?: string
  size?: 'small' | 'medium' | 'large'
}

export const Icon: React.FC<IconProps> = ({ name = 'default', size = 'medium', className = '' }) => {
  const sizeClasses = { small: 'text-sm', medium: 'text-xl', large: 'text-3xl' }
  // Simple emoji/text fallback for icons
  const iconMap: Record<string, string> = {
    users: '👥',
    settings: '⚙️',
    dashboard: '📊',
    home: '🏠',
    edit: '✏️',
    delete: '🗑️',
    add: '➕',
    check: '✓',
    close: '✕',
    arrow_up: '↑',
    arrow_down: '↓',
    trending_up: '📈',
    trending_down: '📉',
  }
  return <span className={`${sizeClasses[size]} ${className}`}>{iconMap[name] || `[${name}]`}</span>
}

export const Divider: React.FC<LuaComponentProps> = ({ className = 'border-t my-4' }) => (
  <hr className={className} />
)

export const Avatar: React.FC<LuaComponentProps & { src?: string; alt?: string }> = ({ 
  src, 
  alt = 'Avatar',
  className = 'w-10 h-10 rounded-full bg-muted flex items-center justify-center'
}) => (
  src ? <img src={src} alt={alt} className={className} /> : <div className={className}>{alt[0]}</div>
)

interface TabsProps extends LuaComponentProps {
  value?: string
  items?: Array<{ value: string; label: string; content?: ReactNode }>
}

export const Tabs: React.FC<TabsProps> = ({ items = [], className = '' }) => {
  const [active, setActive] = React.useState(items[0]?.value || '')
  
  return (
    <div className={className}>
      <div className="flex border-b gap-4">
        {items.map(item => (
          <button
            key={item.value}
            className={`py-2 px-1 border-b-2 transition-colors ${
              active === item.value 
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActive(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {items.find(i => i.value === active)?.content}
      </div>
    </div>
  )
}

export const Tab: React.FC<LuaComponentProps & { label?: string; value?: string }> = ({ 
  label, 
  children,
  className = 'py-2 px-4'
}) => (
  <div className={className}>{label || children}</div>
)

export const Alert: React.FC<LuaComponentProps & { severity?: 'info' | 'success' | 'warning' | 'error' }> = ({
  severity = 'info',
  className = '',
  children,
}) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }
  return <div className={`p-4 rounded border ${colors[severity]} ${className}`}>{children}</div>
}

// Progress bar component
interface ProgressProps extends LuaComponentProps {
  value?: number
  max?: number
  variant?: 'determinate' | 'indeterminate'
  color?: 'primary' | 'secondary' | 'success' | 'error'
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  variant = 'determinate',
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const colorClasses = {
    primary: 'bg-accent',
    secondary: 'bg-muted-foreground',
    success: 'bg-green-500',
    error: 'bg-red-500',
  }
  
  return (
    <div className={`w-full h-2 bg-muted rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${colorClasses[color]} transition-all duration-300 ${variant === 'indeterminate' ? 'animate-pulse' : ''}`}
        style={{ width: variant === 'determinate' ? `${percentage}%` : '50%' }}
      />
    </div>
  )
}

export const Badge: React.FC<LuaComponentProps & { color?: string }> = ({
  color: _color = 'default',
  className = '',
  children,
}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted ${className}`}>
    {children}
  </span>
)

export const Chip: React.FC<LuaComponentProps & { label?: string }> = ({
  label,
  className = 'inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted',
  children,
}) => (
  <span className={className}>{label || children}</span>
)

// Placeholder components for complex Lua package components
export const Level4Header: React.FC<LuaComponentProps & { username?: string; nerdMode?: boolean }> = ({
  username = 'User',
  nerdMode = false,
}) => (
  <header className="border-b p-4 flex items-center justify-between bg-canvas">
    <div className="flex items-center gap-4">
      <Typography variant="h5">Level 4 - Admin Panel</Typography>
      {nerdMode && <Badge>Nerd Mode</Badge>}
    </div>
    <div className="flex items-center gap-2">
      <Avatar alt={username} />
      <span>{username}</span>
    </div>
  </header>
)

export const IntroSection: React.FC<LuaComponentProps & { 
  eyebrow?: string
  title?: string
  description?: string 
}> = ({ eyebrow, title, description }) => (
  <section className="space-y-4">
    {eyebrow && <Typography variant="overline">{eyebrow}</Typography>}
    {title && <Typography variant="h2">{title}</Typography>}
    {description && <Typography variant="body1" className="text-muted-foreground">{description}</Typography>}
  </section>
)

export const AppHeader: React.FC<LuaComponentProps> = ({ children }) => (
  <header className="border-b p-4 bg-canvas">{children}</header>
)

export const AppFooter: React.FC<LuaComponentProps> = ({ children }) => (
  <footer className="border-t p-4 bg-canvas mt-auto">{children}</footer>
)

export const Sidebar: React.FC<LuaComponentProps> = ({ children, className = 'w-64 border-r p-4 bg-canvas' }) => (
  <aside className={className}>{children}</aside>
)

// Form inputs
interface TextFieldProps extends LuaComponentProps {
  label?: string
  placeholder?: string
  type?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
}

export const TextField: React.FC<TextFieldProps> = ({ 
  label, 
  placeholder, 
  type = 'text',
  fullWidth = false,
  size = 'medium',
  className = ''
}) => (
  <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <input 
      type={type}
      placeholder={placeholder}
      className={`border rounded px-3 ${size === 'small' ? 'py-1 text-sm' : 'py-2'} ${fullWidth ? 'w-full' : ''}`}
    />
  </div>
)

interface SelectProps extends LuaComponentProps {
  label?: string
  options?: Array<{ value: string | number; label: string }>
}

export const Select: React.FC<SelectProps> = ({ label, options = [], className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <select className="border rounded px-3 py-2 w-full">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

// Navigation
export const AppBar: React.FC<LuaComponentProps> = ({ children, className = 'bg-canvas border-b' }) => (
  <header className={className}>{children}</header>
)

export const Toolbar: React.FC<LuaComponentProps> = ({ children, className = 'flex items-center gap-4 px-4 py-2' }) => (
  <div className={className}>{children}</div>
)

export const Link: React.FC<LuaComponentProps & { href?: string }> = ({ href = '#', children, className = 'text-accent hover:underline' }) => (
  <a href={href} className={className}>{children}</a>
)

// IconButton - clickable icon with button behavior
interface IconButtonProps extends LuaComponentProps {
  onClick?: () => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'default' | 'inherit'
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'p-1 text-sm',
    medium: 'p-2',
    large: 'p-3 text-lg'
  }
  return (
    <button 
      className={`rounded-full hover:bg-muted/50 transition-colors inline-flex items-center justify-center ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Menu - dropdown menu container
interface MenuProps extends LuaComponentProps {
  open?: boolean
  anchorEl?: unknown
  onClose?: () => void
}

export const Menu: React.FC<MenuProps> = ({ children, className = '' }) => {
  // Simplified menu - in storybook, always show children as a dropdown preview
  return (
    <div className={`absolute right-0 top-full mt-1 bg-canvas border rounded-md shadow-lg min-w-[160px] py-1 z-50 ${className}`}>
      {children}
    </div>
  )
}

// MenuItem - individual menu item
interface MenuItemProps extends LuaComponentProps {
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
}

export const MenuItem: React.FC<MenuItemProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  selected = false,
  className = '' 
}) => (
  <div 
    className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-muted ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${selected ? 'bg-accent/10' : ''} ${className}`}
    onClick={disabled ? undefined : onClick}
  >
    {children}
  </div>
)

// Lists
export const List: React.FC<LuaComponentProps> = ({ children, className = 'flex flex-col' }) => (
  <ul className={className}>{children}</ul>
)

export const ListItem: React.FC<LuaComponentProps & { button?: boolean; selected?: boolean }> = ({ 
  button = false, 
  selected = false,
  children, 
  className = '' 
}) => (
  <li className={`flex items-center gap-2 px-4 py-2 ${button ? 'cursor-pointer hover:bg-muted' : ''} ${selected ? 'bg-accent/10' : ''} ${className}`}>
    {children}
  </li>
)

// Data display
interface TableProps extends LuaComponentProps {
  columns?: Array<{ field: string; headerName: string; width?: number; flex?: number }>
  rows?: Array<Record<string, unknown>>
}

export const Table: React.FC<TableProps> = ({ columns = [], rows = [], className = '' }) => (
  <div className={`overflow-auto ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted">
          {columns.map(col => (
            <th key={col.field} className="text-left px-4 py-2 font-medium border-b" style={{ width: col.width }}>
              {col.headerName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b hover:bg-muted/50">
            {columns.map(col => (
              <td key={col.field} className="px-4 py-2">
                {String(row[col.field] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const Pagination: React.FC<LuaComponentProps & { count?: number; page?: number }> = ({ 
  count = 1, 
  page = 1,
  className = 'flex items-center gap-2'
}) => (
  <div className={className}>
    <button className="px-2 py-1 border rounded" disabled={page <= 1}>←</button>
    <span className="text-sm">Page {page} of {count}</span>
    <button className="px-2 py-1 border rounded" disabled={page >= count}>→</button>
  </div>
)

/**
 * Component Registry - maps Lua type names to React components
 */
export const componentRegistry: Record<string, AnyComponent> = {
  // Layout
  Box,
  Stack,
  Flex,
  Grid,
  Container,
  
  // Surfaces
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardTitle: CardHeader,
  CardFooter: CardActions,
  Paper,
  
  // Typography
  Typography,
  Text: Typography,
  Heading: Typography,
  
  // Inputs
  Button,
  TextField,
  Select,
  
  // Display
  Icon,
  Avatar,
  Badge,
  Chip,
  Divider,
  Alert,
  
  // Navigation
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Link,
  List,
  ListItem,
  IconButton,
  Menu,
  MenuItem,
  
  // Data
  Table,
  Pagination,
  
  // App-specific (from Lua packages)
  Level4Header,
  IntroSection,
  AppHeader,
  AppFooter,
  Sidebar,
}

/**
 * Get a component by its Lua type name
 */
export function getComponent(typeName: string): AnyComponent | undefined {
  return componentRegistry[typeName]
}

/**
 * Register a custom component
 */
export function registerComponent(typeName: string, component: AnyComponent): void {
  componentRegistry[typeName] = component
}

/**
 * Check if a component type is registered
 */
export function hasComponent(typeName: string): boolean {
  return typeName in componentRegistry
}
