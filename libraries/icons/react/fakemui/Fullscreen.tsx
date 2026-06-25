import React from 'react'
import { Icon, IconProps } from './Icon'

export const Fullscreen = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="40,96 40,40 96,40" />
    <polyline points="160,40 216,40 216,96" />
    <polyline points="216,160 216,216 160,216" />
    <polyline points="96,216 40,216 40,160" />
  </Icon>
)
