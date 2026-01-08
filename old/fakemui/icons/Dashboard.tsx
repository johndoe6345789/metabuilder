import React from 'react'
import { Icon, IconProps } from './Icon'

export const Dashboard = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="32" width="88" height="88" rx="8" />
    <rect x="136" y="32" width="88" height="56" rx="8" />
    <rect x="32" y="136" width="88" height="88" rx="8" />
    <rect x="136" y="104" width="88" height="120" rx="8" />
  </Icon>
)
