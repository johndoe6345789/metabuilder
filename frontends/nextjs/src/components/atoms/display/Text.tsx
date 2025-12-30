'use client'

import { Text as FakemuiText, Typography } from '@/fakemui'
import { forwardRef } from 'react'

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'subtitle1'
  | 'subtitle2'
  | 'caption'
  | 'overline'

export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

/**
 * Props for the Text component
 * Wrapper around fakemui Text/Typography to maintain API compatibility
 */
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Typography variant (MUI compatibility) */
  variant?: TextVariant
  /** Font weight */
  weight?: TextWeight
  /** Text alignment */
  align?: TextAlign
  /** Muted/secondary text style */
  muted?: boolean
  /** Truncate text with ellipsis */
  truncate?: boolean
  /** MUI sx prop - converted to className for compatibility */
  sx?: any
  /** MUI component prop - specify HTML element */
  component?: React.ElementType
}

const weightMap = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    { variant = 'body1', weight = 'regular', align = 'left', muted, truncate, sx, className, component, ...props },
    ref
  ) => {
    // For heading variants, use Typography
    if (variant && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant)) {
      const combinedClassName = [
        className,
        sx?.className,
        weightMap[weight],
        muted ? 'text-secondary' : '',
        truncate ? 'truncate' : '',
        `text-${align}`,
      ].filter(Boolean).join(' ')

      return (
        <Typography
          ref={ref as any}
          variant={variant}
          className={combinedClassName}
          as={component}
          {...props}
        />
      )
    }

    // For body/caption variants, use fakemui Text
    const combinedClassName = [
      className,
      sx?.className,
      weightMap[weight],
      `text-${align}`,
    ].filter(Boolean).join(' ')

    return (
      <FakemuiText
        ref={ref as any}
        secondary={muted}
        truncate={truncate}
        className={combinedClassName}
        as={component || 'span'}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

export { Text }
