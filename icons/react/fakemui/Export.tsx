import React from 'react'
import { Icon, IconProps } from './Icon'

export const Export = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="88 96 128 56 168 96" />
    <line x1="128" y1="152" x2="128" y2="56" />
    <path d="M216 152v48a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-48" />
  </Icon>
)
