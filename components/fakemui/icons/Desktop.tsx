import React from 'react'
import { Icon, IconProps } from './Icon'

export const Desktop = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="128" rx="8" fill="none" />
    <line x1="128" y1="176" x2="128" y2="216" />
    <line x1="88" y1="216" x2="168" y2="216" />
  </Icon>
)
