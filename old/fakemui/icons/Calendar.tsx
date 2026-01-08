import React from 'react'
import { Icon, IconProps } from './Icon'

export const Calendar = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <line x1="176" y1="24" x2="176" y2="56" />
    <line x1="80" y1="24" x2="80" y2="56" />
    <line x1="40" y1="88" x2="216" y2="88" />
  </Icon>
)
