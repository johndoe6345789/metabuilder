import React from 'react'
import { Icon, IconProps } from './Icon'

export const Eye = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 56C48 56 16 128 16 128s32 72 112 72 112-72 112-72-32-72-112-72Z" />
    <circle cx="128" cy="128" r="40" />
  </Icon>
)
