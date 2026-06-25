import React from 'react'
import { Icon, IconProps } from './Icon'

export const Queue = (props: IconProps) => (
  <Icon {...props}>
    <line x1="48" y1="80" x2="208" y2="80" />
    <line x1="48" y1="128" x2="208" y2="128" />
    <line x1="48" y1="176" x2="160" y2="176" />
    <circle cx="200" cy="176" r="24" />
    <line x1="200" y1="160" x2="200" y2="192" />
    <line x1="184" y1="176" x2="216" y2="176" />
  </Icon>
)
