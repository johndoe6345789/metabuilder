import React from 'react'
import { Icon, IconProps } from './Icon'

export const X = (props: IconProps) => (
  <Icon {...props}>
    <line x1="200" y1="56" x2="56" y2="200" />
    <line x1="200" y1="200" x2="56" y2="56" />
  </Icon>
)
