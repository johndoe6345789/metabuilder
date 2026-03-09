import React from 'react'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/typography.module.scss'

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption' | 'overline'

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  variant?: TypographyVariant
  color?: 'primary' | 'secondary' | 'error' | 'inherit' | string
  align?: 'left' | 'center' | 'right' | 'justify'
  gutterBottom?: boolean
  noWrap?: boolean
  as?: React.ElementType
  component?: React.ElementType  // MUI-compatible alias for 'as'
  sx?: Record<string, unknown>  // MUI sx prop for styling compatibility
  /** Test ID for automated testing */
  testId?: string
}

// Map variant prop to CSS module class names
const variantClassMap: Record<TypographyVariant, string> = {
  h1: styles.typographyH1,
  h2: styles.typographyH2,
  h3: styles.typographyH3,
  h4: styles.typographyH4,
  h5: styles.typographyH5,
  h6: styles.typographyH6,
  body1: styles.typographyBody1,
  body2: styles.typographyBody2,
  subtitle1: styles.typographySubtitle1,
  subtitle2: styles.typographySubtitle2,
  caption: styles.typographyCaption,
  overline: styles.typographyOverline,
}

// Map color prop to CSS module class names
const colorClassMap: Record<string, string | undefined> = {
  primary: styles.typographyPrimary,
  secondary: styles.typographySecondary,
  error: styles.typographyError,
  inherit: styles.typographyInherit,
}

// Map align prop to CSS module class names
const alignClassMap: Record<string, string | undefined> = {
  center: styles.typographyCenter,
  right: styles.typographyRight,
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant,
  color,
  align,
  gutterBottom,
  noWrap,
  testId,
  className = '',
  as,
  component,
  sx,
  style,
  ...props
}) => {
  // Support both 'as' and 'component' props (component is MUI-style)
  const Tag =
    as ||
    component ||
    (variant === 'h1' ||
    variant === 'h2' ||
    variant === 'h3' ||
    variant === 'h4' ||
    variant === 'h5' ||
    variant === 'h6'
      ? variant
      : 'p')

  // Build class list from CSS modules
  const classes = [
    styles.typography,
    variant && variantClassMap[variant],
    color && colorClassMap[color],
    align && alignClassMap[align],
    gutterBottom && styles.typographyGutterBottom,
    noWrap && styles.typographyNoWrap,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      className={classes}
      style={{ ...sxToStyle(sx), ...style }}
      data-testid={testId}
      {...props}
    >
      {children}
    </Tag>
  )
}
