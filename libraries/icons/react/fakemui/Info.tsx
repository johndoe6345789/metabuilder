import React from 'react'
import { Icon, IconProps } from './Icon'

export const Info = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <line x1="128" y1="120" x2="128" y2="176" />
    <circle cx="128" cy="84" r="4" fill="currentColor" />
  </Icon>
)
