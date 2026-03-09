import React from 'react'
import { Icon, IconProps } from './Icon'

export const ZoomInMap = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="152 104 152 56 104 56" />
    <line x1="104 104" x2="152 56" />
    <polyline points="104 152 104 200 152 200" />
    <line x1="152 152" x2="104 200" />
    <polyline points="56 104 56 152 104 152" />
    <line x1="56 104" x2="104 152" />
    <polyline points="200 152 200 104 152 104" />
    <line x1="200 152" x2="152 104" />
  </Icon>
)
