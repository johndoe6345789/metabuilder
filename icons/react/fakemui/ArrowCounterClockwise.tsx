import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowCounterClockwise = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="80 88 24 88 24 32" />
    <path d="M192 128a96 96 0 1 1-45.5-81.4L24 88" fill="none" />
  </Icon>
)
