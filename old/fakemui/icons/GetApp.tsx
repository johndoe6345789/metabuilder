import React from 'react'
import { Icon, IconProps } from './Icon'

export const GetApp = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="40" x2="128" y2="168" />
    <polyline points="88 128 128 168 168 128" />
    <line x1="56" y1="216" x2="200" y2="216" />
  </Icon>
)
