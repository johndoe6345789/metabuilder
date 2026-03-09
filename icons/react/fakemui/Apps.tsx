import React from 'react'
import { Icon, IconProps } from './Icon'

export const Apps = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="56" height="56" rx="8" />
    <rect x="40" y="140" width="56" height="56" rx="8" />
    <rect x="140" y="40" width="56" height="56" rx="8" />
    <rect x="140" y="140" width="56" height="56" rx="8" />
  </Icon>
)
