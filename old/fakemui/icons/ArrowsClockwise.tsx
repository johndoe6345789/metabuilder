import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowsClockwise = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="176 168 224 168 224 216" />
    <polyline points="80 88 32 88 32 40" />
    <path d="M195.9 60.1a96 96 0 0 1 0 135.8l-28.1 28.1" fill="none" />
    <path d="M60.1 195.9a96 96 0 0 1 0-135.8l28.1-28.1" fill="none" />
  </Icon>
)
