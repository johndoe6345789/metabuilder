import React from 'react'
import { Icon, IconProps } from './Icon'

export const Minimize = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="152 104 208 104 208 48" />
    <line x1="152" y1="104" x2="208" y2="48" />
    <polyline points="104 152 48 152 48 208" />
    <line x1="104" y1="152" x2="48" y2="208" />
  </Icon>
)
