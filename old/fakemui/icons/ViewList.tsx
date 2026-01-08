import React from 'react'
import { Icon, IconProps } from './Icon'

export const ViewList = (props: IconProps) => (
  <Icon {...props}>
    <line x1="88" y1="64" x2="224" y2="64" />
    <line x1="88" y1="128" x2="224" y2="128" />
    <line x1="88" y1="192" x2="224" y2="192" />
    <rect x="32" y="56" width="16" height="16" rx="4" />
    <rect x="32" y="120" width="16" height="16" rx="4" />
    <rect x="32" y="184" width="16" height="16" rx="4" />
  </Icon>
)
