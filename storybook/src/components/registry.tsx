/**
 * Component Registry
 * Maps JSON component type names to React components
 */

import React, { type ComponentType, type ReactNode } from 'react'

export interface ComponentProps {
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

type AnyComponent = ComponentType<ComponentProps>

/**
 * Basic UI Components
 * These mirror the components available in the main app's fakemui library
 */

export const Box: React.FC<ComponentProps> = ({ className, children, ...props }) => (
  <div className={className} {...props}>{children}</div>
)

export const Stack: React.FC<ComponentProps> = ({ className = 'flex flex-col gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Flex: React.FC<ComponentProps> = ({ className = 'flex gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Grid: React.FC<ComponentProps> = ({ className = 'grid grid-cols-2 gap-4', children }) => (
  <div className={className}>{children}</div>
)

export const Container: React.FC<ComponentProps> = ({ className = 'max-w-7xl mx-auto px-4', children }) => (
  <div className={className}>{children}</div>
)

export const Card: React.FC<ComponentProps> = ({ className = 'rounded-lg border shadow-sm bg-canvas', children }) => (
  <div className={className}>{children}</div>
)

export const CardHeader: React.FC<ComponentProps> = ({ className = 'p-6 pb-2', children }) => (
  <div className={className}>{children}</div>
)

export const CardContent: React.FC<ComponentProps> = ({ className = 'p-6 pt-0', children }) => (
  <div className={className}>{children}</div>
)

export const CardActions: React.FC<ComponentProps> = ({ className = 'p-6 pt-0 flex gap-2', children }) => (
  <div className={className}>{children}</div>
)

export const CardDescription: React.FC<ComponentProps> = ({ className = 'text-sm text-muted-foreground', children }) => (
  <p className={className}>{children}</p>
)

// ScrollArea - scrollable container
export const ScrollArea: React.FC<ComponentProps & { maxHeight?: string | number }> = ({
  className = 'overflow-auto',
  maxHeight,
  children
}) => (
  <div className={className} style={{ maxHeight: maxHeight || 'auto' }}>{children}</div>
)

// ComponentRef - placeholder for dynamic component references
export const ComponentRef: React.FC<ComponentProps & { refId?: string; component?: string }> = ({
  refId,
  component,
  className = 'p-2 border border-dashed rounded bg-muted/30',
  children
}) => (
  <div className={className}>
    {children || <span className="text-xs text-muted-foreground">Component: {component || refId || 'unknown'}</span>}
  </div>
)

export const Paper: React.FC<ComponentProps> = ({ className = 'rounded border p-4 bg-canvas', children }) => (
  <div className={className}>{children}</div>
)

interface TypographyProps extends ComponentProps {
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

interface ButtonProps extends ComponentProps {
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

interface IconProps extends ComponentProps {
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

export const Divider: React.FC<ComponentProps> = ({ className = 'border-t my-4' }) => (
  <hr className={className} />
)

export const Avatar: React.FC<ComponentProps & { src?: string; alt?: string }> = ({ 
  src, 
  alt = 'Avatar',
  className = 'w-10 h-10 rounded-full bg-muted flex items-center justify-center'
}) => (
  src ? <img src={src} alt={alt} className={className} /> : <div className={className}>{alt[0]}</div>
)

interface TabsProps extends ComponentProps {
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

export const Tab: React.FC<ComponentProps & { label?: string; value?: string }> = ({ 
  label, 
  children,
  className = 'py-2 px-4'
}) => (
  <div className={className}>{label || children}</div>
)

export const Alert: React.FC<ComponentProps & { severity?: 'info' | 'success' | 'warning' | 'error' }> = ({
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
interface ProgressProps extends ComponentProps {
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

// CircularProgress - spinning loader
interface CircularProgressProps extends ComponentProps {
  size?: 'small' | 'medium' | 'large' | number
  color?: 'primary' | 'secondary' | 'inherit'
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 'medium',
  className = '',
}) => {
  const sizeMap = { small: 16, medium: 24, large: 40 }
  const actualSize = typeof size === 'number' ? size : sizeMap[size]
  
  return (
    <div 
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: actualSize, height: actualSize }}
      role="progressbar"
    />
  )
}

// Skeleton - loading placeholder
interface SkeletonProps extends ComponentProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | false
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
}) => {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-md',
  }
  
  const animationClass = animation === 'pulse' ? 'animate-pulse' : animation === 'wave' ? 'animate-pulse' : ''
  
  return (
    <div 
      className={`bg-muted ${variantClasses[variant]} ${animationClass} ${className}`}
      style={{ 
        width: width || (variant === 'circular' ? 40 : '100%'), 
        height: height || (variant === 'text' ? 16 : variant === 'circular' ? 40 : 100) 
      }}
    />
  )
}

export const Badge: React.FC<ComponentProps & { color?: string }> = ({
  color: _color = 'default',
  className = '',
  children,
}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted ${className}`}>
    {children}
  </span>
)

export const Chip: React.FC<ComponentProps & { label?: string }> = ({
  label,
  className = 'inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted',
  children,
}) => (
  <span className={className}>{label || children}</span>
)

// Placeholder components for complex script package components
export const Level4Header: React.FC<ComponentProps & { username?: string; nerdMode?: boolean }> = ({
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

export const IntroSection: React.FC<ComponentProps & { 
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

export const AppHeader: React.FC<ComponentProps> = ({ children }) => (
  <header className="border-b p-4 bg-canvas">{children}</header>
)

export const AppFooter: React.FC<ComponentProps> = ({ children }) => (
  <footer className="border-t p-4 bg-canvas mt-auto">{children}</footer>
)

export const Sidebar: React.FC<ComponentProps> = ({ children, className = 'w-64 border-r p-4 bg-canvas' }) => (
  <aside className={className}>{children}</aside>
)

// Dialog components
interface DialogProps extends ComponentProps {
  open?: boolean
  onClose?: () => void
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export const Dialog: React.FC<DialogProps> = ({ 
  children, 
  className = '',
  maxWidth = 'sm',
}) => {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
      <div className={`bg-canvas rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4`}>
        {children}
      </div>
    </div>
  )
}

export const DialogTitle: React.FC<ComponentProps> = ({ children, className = 'px-6 py-4 border-b font-semibold text-lg flex items-center gap-2' }) => (
  <div className={className}>{children}</div>
)

export const DialogContent: React.FC<ComponentProps> = ({ children, className = 'px-6 py-4' }) => (
  <div className={className}>{children}</div>
)

export const DialogActions: React.FC<ComponentProps> = ({ children, className = 'px-6 py-4 border-t flex justify-end gap-2' }) => (
  <div className={className}>{children}</div>
)

// Form inputs
interface TextFieldProps extends ComponentProps {
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

interface SelectProps extends ComponentProps {
  label?: string
  options?: Array<{ value: string | number; label: string }> | Record<string, unknown>
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', children }) => {
  // Normalize options - could be array, object, or undefined
  const optionsArray = Array.isArray(options) ? options : []
  
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select className="border rounded px-3 py-2 w-full">
        {optionsArray.map((opt, i) => (
          <option key={opt.value ?? i} value={opt.value}>{opt.label}</option>
        ))}
        {children}
      </select>
    </div>
  )
}

// Label - standalone label component
export const Label: React.FC<ComponentProps & { htmlFor?: string }> = ({ 
  htmlFor, 
  children, 
  className = 'block text-sm font-medium mb-1' 
}) => (
  <label htmlFor={htmlFor} className={className}>{children}</label>
)

// Textarea - multiline text input
interface TextareaProps extends ComponentProps {
  label?: string
  placeholder?: string
  rows?: number
  fullWidth?: boolean
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  placeholder, 
  rows = 4,
  fullWidth = false,
  className = ''
}) => (
  <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <textarea 
      placeholder={placeholder}
      rows={rows}
      className={`border rounded px-3 py-2 ${fullWidth ? 'w-full' : ''}`}
    />
  </div>
)

// Switch - toggle switch input
interface SwitchProps extends ComponentProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked = false, 
  disabled = false,
  label,
  className = '' 
}) => {
  const [isChecked, setIsChecked] = React.useState(checked)
  
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div 
        className={`relative w-10 h-6 rounded-full transition-colors ${isChecked ? 'bg-accent' : 'bg-muted'}`}
        onClick={() => !disabled && setIsChecked(!isChecked)}
      >
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
}

// FormField - wrapper for form inputs with label and error
interface FormFieldProps extends ComponentProps {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  required,
  helperText,
  children,
  className = 'mb-4' 
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {helperText && !error && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

// ConditionalRender - renders children based on condition (always renders in Storybook for preview)
interface ConditionalRenderProps extends ComponentProps {
  condition?: boolean
  when?: string
  fallback?: React.ReactNode
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({ 
  children,
  className = '' 
}) => (
  <div className={className}>{children}</div>
)

// Image - image component
interface ImageProps extends ComponentProps {
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none'
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = 'Image',
  width,
  height,
  objectFit = 'cover',
  className = '' 
}) => (
  src ? (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{ width, height, objectFit }}
    />
  ) : (
    <div 
      className={`bg-muted flex items-center justify-center text-muted-foreground ${className}`}
      style={{ width: width || 200, height: height || 150 }}
    >
      [Image: {alt}]
    </div>
  )
)

// Iframe - embedded frame
interface IframeProps extends ComponentProps {
  src?: string
  title?: string
  width?: string | number
  height?: string | number
  allowFullScreen?: boolean
}

export const Iframe: React.FC<IframeProps> = ({ 
  src, 
  title = 'Embedded content',
  width = '100%',
  height = 400,
  className = '' 
}) => (
  src ? (
    <iframe 
      src={src} 
      title={title}
      className={`border rounded ${className}`}
      style={{ width, height }}
    />
  ) : (
    <div 
      className={`bg-muted border rounded flex items-center justify-center text-muted-foreground ${className}`}
      style={{ width, height }}
    >
      [Iframe: {title}]
    </div>
  )
)

// Navigation
export const AppBar: React.FC<ComponentProps> = ({ children, className = 'bg-canvas border-b' }) => (
  <header className={className}>{children}</header>
)

export const Toolbar: React.FC<ComponentProps> = ({ children, className = 'flex items-center gap-4 px-4 py-2' }) => (
  <div className={className}>{children}</div>
)

export const Link: React.FC<ComponentProps & { href?: string }> = ({ href = '#', children, className = 'text-accent hover:underline' }) => (
  <a href={href} className={className}>{children}</a>
)

// IconButton - clickable icon with button behavior
interface IconButtonProps extends ComponentProps {
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
interface MenuProps extends ComponentProps {
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
interface MenuItemProps extends ComponentProps {
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
export const List: React.FC<ComponentProps> = ({ children, className = 'flex flex-col' }) => (
  <ul className={className}>{children}</ul>
)

export const ListItem: React.FC<ComponentProps & { button?: boolean; selected?: boolean }> = ({ 
  button = false, 
  selected = false,
  children, 
  className = '' 
}) => (
  <li className={`flex items-center gap-2 px-4 py-2 ${button ? 'cursor-pointer hover:bg-muted' : ''} ${selected ? 'bg-accent/10' : ''} ${className}`}>
    {children}
  </li>
)

// ListItemIcon - icon container in list items
export const ListItemIcon: React.FC<ComponentProps> = ({ children, className = 'flex-shrink-0 w-6 h-6 flex items-center justify-center' }) => (
  <span className={className}>{children}</span>
)

// ListItemText - text container in list items
interface ListItemTextProps extends ComponentProps {
  primary?: string
  secondary?: string
}

export const ListItemText: React.FC<ListItemTextProps> = ({ primary, secondary, children, className = 'flex flex-col' }) => (
  <div className={className}>
    {primary && <span className="text-sm font-medium">{primary}</span>}
    {secondary && <span className="text-xs text-muted-foreground">{secondary}</span>}
    {children}
  </div>
)

// ListItemButton - clickable list item
export const ListItemButton: React.FC<ComponentProps & { selected?: boolean; onClick?: () => void }> = ({ 
  selected = false,
  onClick,
  children, 
  className = '' 
}) => (
  <li 
    className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted ${selected ? 'bg-accent/10' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </li>
)

// Collapse - collapsible container
interface CollapseProps extends ComponentProps {
  in?: boolean
  open?: boolean
}

export const Collapse: React.FC<CollapseProps> = ({ 
  in: isIn = true,
  open = true,
  children, 
  className = '' 
}) => {
  const isOpen = isIn || open
  return isOpen ? <div className={className}>{children}</div> : null
}

// Breadcrumbs - navigation breadcrumb trail
interface BreadcrumbsProps extends ComponentProps {
  separator?: React.ReactNode
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  separator = '/',
  children, 
  className = 'flex items-center gap-2 text-sm' 
}) => {
  const items = React.Children.toArray(children)
  return (
    <nav className={className}>
      {items.map((child, i) => (
        <React.Fragment key={i}>
          {child}
          {i < items.length - 1 && <span className="text-muted-foreground">{separator}</span>}
        </React.Fragment>
      ))}
    </nav>
  )
}

// Data display
interface TableProps extends ComponentProps {
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

export const Pagination: React.FC<ComponentProps & { count?: number; page?: number }> = ({ 
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
 * Component Registry - maps JSON type names to React components
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
  CardDescription,
  CardTitle: CardHeader,
  CardFooter: CardActions,
  Paper,
  ScrollArea,
  ComponentRef,
  
  // Typography
  Typography,
  Text: Typography,
  Heading: Typography,
  
  // Inputs
  Button,
  TextField,
  Select,
  Label,
  Textarea,
  Switch,
  FormField,
  
  // Media
  Image,
  Iframe,
  
  // Conditional
  ConditionalRender,
  
  // Display
  Icon,
  Avatar,
  Badge,
  Chip,
  Divider,
  Separator: Divider,
  Alert,
  Progress,
  LinearProgress: Progress,
  CircularProgress,
  Skeleton,
  
  // Navigation
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Collapse,
  Breadcrumbs,
  
  // Data
  Table,
  Pagination,
  
  // Dialogs/Modals
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
  // App-specific (from packages)
  Level4Header,
  IntroSection,
  AppHeader,
  AppFooter,
  Sidebar,
  IRCWebchat,
  
  // Script viewer
}

/**
 * Get a component by its package type name
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
