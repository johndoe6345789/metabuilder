import React from 'react'
import { Icon, IconProps } from './Icon'

export const SelectAll = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <polyline points="80,128 112,160 176,96" />
    <rect x="56" y="56" width="40" height="40" rx="4" />
    <rect x="160" y="56" width="40" height="40" rx="4" />
    <rect x="56" y="160" width="40" height="40" rx="4" />
    <rect x="160" y="160" width="40" height="40" rx="4" />
  </Icon>
)

export default SelectAll
