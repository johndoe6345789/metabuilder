import React from 'react'
import { Icon, IconProps } from './Icon'

export const Gavel = (props: IconProps) => (
  <Icon {...props}>
    <rect x="96" y="40" width="64" height="40" rx="6" />
    <rect x="80" y="80" width="96" height="28" rx="6" />
    <line x1="112" y1="108" x2="64" y2="156" />
    <line x1="128" y1="124" x2="84" y2="168" />
    <rect x="144" y="140" width="84" height="24" rx="8" />
  </Icon>
)
