import React from 'react'
import { Icon, IconProps } from './Icon'

export const LightMode = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="48" fill="none" />
    <line x1="128" y1="40" x2="128" y2="24" />
    <line x1="128" y1="232" x2="128" y2="216" />
    <line x1="40" y1="128" x2="24" y2="128" />
    <line x1="232" y1="128" x2="216" y2="128" />
    <line x1="65.7" y1="65.7" x2="54.3" y2="54.3" />
    <line x1="201.7" y1="201.7" x2="190.3" y2="190.3" />
    <line x1="65.7" y1="190.3" x2="54.3" y2="201.7" />
    <line x1="201.7" y1="54.3" x2="190.3" y2="65.7" />
  </Icon>
)
