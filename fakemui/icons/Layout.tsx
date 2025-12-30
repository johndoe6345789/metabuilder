import React from 'react'
import { Icon, IconProps } from './Icon'

export const Layout = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="160" rx="8" />
    <line x1="32" y1="104" x2="224" y2="104" />
    <line x1="104" y1="104" x2="104" y2="208" />
  </Icon>
)
