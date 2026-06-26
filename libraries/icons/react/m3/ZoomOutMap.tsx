import React from 'react'
import { Icon, IconProps } from './Icon'

export const ZoomOutMap = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="104 56 56 56 56 104" />
    <line x1="104 104" x2="56 56" />
    <polyline points="152 200 200 200 200 152" />
    <line x1="152 152" x2="200 200" />
    <polyline points="56 152 56 200 104 200" />
    <line x1="104 152" x2="56 200" />
    <polyline points="200 104 200 56 152 56" />
    <line x1="152 104" x2="200 56" />
  </Icon>
)
