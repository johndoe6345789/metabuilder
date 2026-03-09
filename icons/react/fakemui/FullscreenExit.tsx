import React from 'react'
import { Icon, IconProps } from './Icon'

export const FullscreenExit = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="96,40 96,96 40,96" />
    <polyline points="216,96 160,96 160,40" />
    <polyline points="160,216 160,160 216,160" />
    <polyline points="40,160 96,160 96,216" />
  </Icon>
)
