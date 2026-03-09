import React from 'react'
import { Icon, IconProps } from './Icon'

export const DateRange = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="56" width="176" height="160" rx="8" fill="none" />
    <line x1="88" y1="40" x2="88" y2="72" />
    <line x1="168" y1="40" x2="168" y2="72" />
    <line x1="40" y1="104" x2="216" y2="104" />
    <rect x="64" y="128" width="32" height="32" rx="4" />
    <rect x="112" y="128" width="32" height="32" rx="4" />
    <rect x="160" y="128" width="32" height="32" rx="4" />
  </Icon>
)
