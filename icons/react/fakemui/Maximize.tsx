import React from 'react'
import { Icon, IconProps } from './Icon'

export const Maximize = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="168 48 208 48 208 88" />
    <line x1="152" y1="104" x2="208" y2="48" />
    <polyline points="88 208 48 208 48 168" />
    <line x1="104" y1="152" x2="48" y2="208" />
  </Icon>
)
