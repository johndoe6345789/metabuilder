import React from 'react'
import { Icon, IconProps } from './Icon'

export const FormatItalic = (props: IconProps) => (
  <Icon {...props}>
    <line x1="160" y1="48" x2="96" y2="208" />
    <line x1="80" y1="48" x2="176" y2="48" />
    <line x1="80" y1="208" x2="176" y2="208" />
  </Icon>
)
