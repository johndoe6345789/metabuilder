import React from 'react'
import { Icon, IconProps } from './Icon'

export const Expand = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="168 48 208 48 208 88" />
    <polyline points="88 208 48 208 48 168" />
    <polyline points="208 168 208 208 168 208" />
    <polyline points="48 88 48 48 88 48" />
  </Icon>
)
