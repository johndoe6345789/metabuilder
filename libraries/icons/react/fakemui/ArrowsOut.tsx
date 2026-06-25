import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowsOut = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="160 48 208 48 208 96" />
    <polyline points="96 208 48 208 48 160" />
    <line x1="152" y1="104" x2="208" y2="48" />
    <line x1="104" y1="152" x2="48" y2="208" />
    <polyline points="96 48 48 48 48 96" />
    <polyline points="160 208 208 208 208 160" />
    <line x1="104" y1="104" x2="48" y2="48" />
    <line x1="152" y1="152" x2="208" y2="208" />
  </Icon>
)
