import React from 'react'
import { Icon, IconProps } from './Icon'

export const Link = (props: IconProps) => (
  <Icon {...props}>
    <path d="M122.3 71.4 153.8 40a40 40 0 0 1 62.2 50.4l-36 45" />
    <path d="M133.7 184.6 102.2 216a40 40 0 0 1-62.2-50.4l36-45" />
    <line x1="96" y1="160" x2="160" y2="96" />
  </Icon>
)
