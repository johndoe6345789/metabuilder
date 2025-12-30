'use client'

import { Button as FakemuiButton, ButtonProps as FakemuiButtonProps, ButtonVariant as FakemuiButtonVariant, ButtonSize as FakemuiButtonSize } from '@/fakemui/fakemui/inputs'
import { type AnchorHTMLAttributes, forwardRef, CSSProperties } from 'react'
import styles from './Button.module.scss'

/** Button visual style variants */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

/** Button size options */
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

/**
 * Props for the Button component
 * @extends {FakemuiButtonProps} Inherits fakemui Button props
 */
export interface ButtonProps extends Omit<FakemuiButtonProps, 'variant' | 'size'> {
  /** Visual style variant of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Compatibility prop - ignored */
  asChild?: boolean
  /** Target attribute for link buttons */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target']
  /** Rel attribute for link buttons */
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel']
  /** Custom inline styles */
  style?: CSSProperties
}

const variantMap: Record<ButtonVariant, FakemuiButtonVariant> = {
  default: 'primary',
  destructive: 'danger',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'text',
}

const sizeMap: Record<ButtonSize, FakemuiButtonSize> = {
  default: 'md',
  sm: 'sm',
  lg: 'lg',
  icon: 'md',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', children, className, style, ...props }, ref) => {
    const fakemuiVariant = variantMap[variant]
    const fakemuiSize = sizeMap[size]
    const isIcon = size === 'icon'
    const isLink = variant === 'link'

    return (
      <FakemuiButton
        ref={ref}
        variant={fakemuiVariant}
        size={fakemuiSize}
        icon={isIcon}
        className={`${styles.button} ${isLink ? styles.link : ''} ${isIcon ? styles.icon : ''} ${className || ''}`}
        style={style}
        {...props}
      >
        {children}
      </FakemuiButton>
    )
  }
)

Button.displayName = 'Button'

export { Button }
