import React from 'react'
import { Icon, IconProps } from './Icon'

export const MapTrifold = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="96 184 32 200 32 56 96 40" />
    <polyline points="160 216 96 184 96 40 160 72 160 216" />
    <polyline points="160 72 224 56 224 200 160 216" />
  </Icon>
)
