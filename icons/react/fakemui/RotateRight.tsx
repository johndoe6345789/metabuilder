import React from 'react'
import { Icon, IconProps } from './Icon'

export const RotateRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 40a88 88 0 1 1-88 88" fill="none" />
    <polyline points="168 24 128 40 168 56" fill="none" />
  </Icon>
)
