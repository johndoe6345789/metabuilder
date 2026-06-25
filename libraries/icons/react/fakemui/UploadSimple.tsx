import React from 'react'
import { Icon, IconProps } from './Icon'

export const UploadSimple = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="152" x2="128" y2="40" />
    <polyline points="80 88 128 40 176 88" />
    <path d="M216 152v48a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-48" />
  </Icon>
)
