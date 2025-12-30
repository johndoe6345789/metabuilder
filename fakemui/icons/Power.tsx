import React from 'react'
import { Icon, IconProps } from './Icon'

export const Power = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="48" x2="128" y2="128" />
    <path d="M176 56a96 96 0 1 1-96 0" fill="none" />
  </Icon>
)
