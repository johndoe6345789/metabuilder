import React from 'react'
import { Icon, IconProps } from './Icon'

export const FunnelSimple = (props: IconProps) => (
  <Icon {...props}>
    <line x1="24" y1="80" x2="232" y2="80" />
    <line x1="64" y1="128" x2="192" y2="128" />
    <line x1="104" y1="176" x2="152" y2="176" />
  </Icon>
)
