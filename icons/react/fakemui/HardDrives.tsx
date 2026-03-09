import React from 'react'
import { Icon, IconProps } from './Icon'

export const HardDrives = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="40" width="192" height="72" rx="8" />
    <rect x="32" y="144" width="192" height="72" rx="8" />
    <circle cx="188" cy="76" r="12" fill="currentColor" />
    <circle cx="188" cy="180" r="12" fill="currentColor" />
  </Icon>
)
