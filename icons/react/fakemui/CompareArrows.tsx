import React from 'react'
import { Icon, IconProps } from './Icon'

export const CompareArrows = (props: IconProps) => (
  <Icon {...props}>
    <line x1="48" y1="88" x2="208" y2="88" />
    <polyline points="168 48 208 88 168 128" />
    <line x1="208" y1="168" x2="48" y2="168" />
    <polyline points="88 128 48 168 88 208" />
  </Icon>
)
