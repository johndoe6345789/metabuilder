import React from 'react'
import { Icon, IconProps } from './Icon'

export const Gamepad = (props: IconProps) => (
  <Icon {...props}>
    <path d="M40 96 C40 72 64 56 88 56 L168 56 C192 56 216 72 216 96 L216 144 C216 176 200 200 168 200 L88 200 C56 200 40 176 40 144 Z" />
    <line x1="80" y1="104" x2="80" y2="136" />
    <line x1="64" y1="120" x2="96" y2="120" />
    <circle cx="168" cy="104" r="8" />
    <circle cx="184" cy="120" r="8" />
    <circle cx="168" cy="136" r="8" />
    <circle cx="152" cy="120" r="8" />
  </Icon>
)
