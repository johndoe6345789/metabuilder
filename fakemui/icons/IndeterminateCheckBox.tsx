import React from 'react'
import { Icon, IconProps } from './Icon'

export const IndeterminateCheckBox = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <line x1="88" y1="128" x2="168" y2="128" />
  </Icon>
)
