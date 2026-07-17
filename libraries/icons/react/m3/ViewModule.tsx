import React from 'react'
import { Icon, IconProps } from './Icon'

export const ViewModule = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="64" width="56" height="56" rx="4" />
    <rect x="100" y="64" width="56" height="56" rx="4" />
    <rect x="168" y="64" width="56" height="56" rx="4" />
    <rect x="32" y="136" width="56" height="56" rx="4" />
    <rect x="100" y="136" width="56" height="56" rx="4" />
    <rect x="168" y="136" width="56" height="56" rx="4" />
  </Icon>
)
