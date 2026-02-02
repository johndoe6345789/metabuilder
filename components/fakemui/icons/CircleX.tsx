import React from 'react'
import { Icon, IconProps } from './Icon'

export const CircleX = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <line x1="160" y1="96" x2="96" y2="160" />
    <line x1="160" y1="160" x2="96" y2="96" />
  </Icon>
)
