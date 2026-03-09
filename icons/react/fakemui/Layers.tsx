import React from 'react'
import { Icon, IconProps } from './Icon'

export const Layers = (props: IconProps) => (
  <Icon {...props}>
    <polygon points="32 96 128 32 224 96 128 160 32 96" fill="none" />
    <polyline points="32 128 128 192 224 128" />
    <polyline points="32 160 128 224 224 160" />
  </Icon>
)
