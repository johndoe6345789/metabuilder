import React from 'react'
import { Icon, IconProps } from './Icon'

export const RowSelect = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="64" width="176" height="48" rx="4" />
    <rect x="40" y="128" width="176" height="48" rx="4" fill="currentColor" fillOpacity="0.2" />
    <line x1="56" y1="152" x2="72" y2="152" />
    <polyline points="60,148 64,156 76,144" />
    <line x1="88" y1="152" x2="200" y2="152" />
  </Icon>
)

export default RowSelect
