import React from 'react'
import { Icon, IconProps } from './Icon'

export const Publish = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="168" x2="128" y2="40" />
    <polyline points="88 80 128 40 168 80" />
    <line x1="56" y1="216" x2="200" y2="216" />
  </Icon>
)
