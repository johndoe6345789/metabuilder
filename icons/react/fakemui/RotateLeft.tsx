import React from 'react'
import { Icon, IconProps } from './Icon'

export const RotateLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 40a88 88 0 1 0 88 88" fill="none" />
    <polyline points="88 24 128 40 88 56" fill="none" />
  </Icon>
)
