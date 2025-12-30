import React from 'react'
import { Icon, IconProps } from './Icon'

export const Users = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="84" cy="108" r="52" />
    <path d="M10.2 200c20.8-37.2 60.2-60 93.8-60s73 22.8 93.8 60" />
    <circle cx="172" cy="108" r="52" />
    <path d="M172 152c33.6 0 73 22.8 93.8 60" />
  </Icon>
)
