import type { ComponentProps } from 'react'

export interface TextProps extends ComponentProps<'div'> {
  variant?: 'muted' | 'small' | 'body' | 'large' | 'code' | 'lead' | 'subtle' | 'heading' | string
}
