import React from 'react'
import { Icon, IconProps } from './Icon'

export const Repeat = (props: IconProps) => (
  <Icon {...props}>
    <path d="M56 96 L56 160 C56 176 72 192 88 192 L168 192 C184 192 200 176 200 160 L200 96 C200 80 184 64 168 64 L88 64 C72 64 56 80 56 96" />
    <polyline points="80,40 56,64 80,88" />
    <polyline points="176,168 200,192 176,216" />
  </Icon>
)
