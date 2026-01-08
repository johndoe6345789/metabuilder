import React from 'react'
import { Icon, IconProps } from './Icon'

export const Grid = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="32" width="80" height="80" rx="8" />
    <rect x="144" y="32" width="80" height="80" rx="8" />
    <rect x="32" y="144" width="80" height="80" rx="8" />
    <rect x="144" y="144" width="80" height="80" rx="8" />
  </Icon>
)
