import React, { forwardRef, Children, cloneElement, isValidElement } from 'react'

/**
 * Props for ButtonGroup component
 */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Button size to apply to all children */
  size?: 'sm' | 'md' | 'lg'
  /** Button variant to apply to all children */
  variant?: 'contained' | 'outlined' | 'text'
  /** Color theme for buttons */
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
  /** Stack buttons vertically */
  vertical?: boolean
  /** Disable all buttons */
  disabled?: boolean
  /** Full width button group */
  fullWidth?: boolean
}

/**
 * ButtonGroup - Groups related buttons together with consistent styling
 * 
 * @example
 * ```tsx
 * <ButtonGroup variant="contained" color="primary">
 *   <Button>One</Button>
 *   <Button>Two</Button>
 *   <Button>Three</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { 
      children, 
      size = 'md', 
      variant = 'outlined', 
      color = 'primary', 
      vertical = false, 
      disabled = false,
      fullWidth = false,
      className = '', 
      ...props 
    }, 
    ref
  ) => {
    const childArray = Children.toArray(children)
    
    const enhancedChildren = childArray.map((child, index) => {
      if (isValidElement(child)) {
        const isFirst = index === 0
        const isLast = index === childArray.length - 1
        
        return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          size,
          variant,
          color,
          disabled: disabled || (child.props as Record<string, unknown>).disabled,
          className: `btn-group__btn ${isFirst ? 'btn-group__btn--first' : ''} ${isLast ? 'btn-group__btn--last' : ''} ${!isFirst && !isLast ? 'btn-group__btn--middle' : ''}`,
        })
      }
      return child
    })

    return (
      <div
        ref={ref}
        className={`btn-group ${vertical ? 'btn-group--vertical' : ''} ${fullWidth ? 'btn-group--full-width' : ''} ${className}`}
        role="group"
        {...props}
      >
        {enhancedChildren}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'
