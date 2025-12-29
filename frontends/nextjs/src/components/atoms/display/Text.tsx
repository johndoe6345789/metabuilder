'use client'

import { Typography, TypographyProps } from '@mui/material'
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

export interface TextProps extends Omit<TypographyProps, 'variant' | 'align'> {
  variant?: TextVariant
  weight?: TextWeight
  align?: TextAlign
  muted?: boolean
  truncate?: boolean
}

const weightMap = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    { variant = 'body1', weight = 'regular', align = 'left', muted, truncate, sx, ...props },
    ref
  ) => {
    return (
      <Typography
        ref={ref}
        variant={variant}
        align={align}
        sx={{
          fontWeight: weightMap[weight],
          ...(muted && {
            color: 'text.secondary',
          }),
          ...(truncate && {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

export { Text }
