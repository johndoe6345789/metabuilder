import React from 'react'
import { Icon, IconProps } from './Icon'

export const Tree = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="232" x2="128" y2="88" />
    <polygon points="128 24 48 120 88 120 48 200 208 200 168 120 208 120 128 24" fill="none" />
  </Icon>
)
