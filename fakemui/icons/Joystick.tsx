import React from 'react'
import { Icon, IconProps } from './Icon'

export const Joystick = (props: IconProps) => (
  <Icon {...props}>
    <ellipse cx="128" cy="192" rx="72" ry="32" />
    <line x1="128" y1="160" x2="128" y2="96" />
    <circle cx="128" cy="72" r="32" />
    <circle cx="128" cy="72" r="16" />
  </Icon>
)
