import React from 'react'
import { Icon, IconProps } from './Icon'

export const SportsEsports = (props: IconProps) => (
  <Icon {...props}>
    <path d="M40 96 C40 72 64 56 88 56 L168 56 C192 56 216 72 216 96 L216 144 C216 176 200 200 168 200 L152 200 L144 176 L112 176 L104 200 L88 200 C56 200 40 176 40 144 Z" />
    <circle cx="176" cy="112" r="12" />
    <circle cx="176" cy="152" r="12" />
    <circle cx="152" cy="132" r="12" />
    <circle cx="200" cy="132" r="12" />
    <line x1="72" y1="112" x2="72" y2="152" />
    <line x1="52" y1="132" x2="92" y2="132" />
  </Icon>
)
