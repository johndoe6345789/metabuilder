import React from 'react'
import { Icon, IconProps } from './Icon'

export const InsertLink = (props: IconProps) => (
  <Icon {...props}>
    <path d="M136 128H120a40 40 0 0 1 0-80h16" fill="none" />
    <path d="M120 128h16a40 40 0 0 1 0 80h-16" fill="none" />
    <line x1="80" y1="128" x2="176" y2="128" />
  </Icon>
)
