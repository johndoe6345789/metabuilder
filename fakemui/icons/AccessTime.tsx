import React from 'react'
import { Icon, IconProps } from './Icon'

export const AccessTime = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" fill="none" />
    <polyline points="128 72 128 128 168 152" fill="none" />
  </Icon>
)
