import React from 'react'
import { Icon, IconProps } from './Icon'

export const UserCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <circle cx="128" cy="120" r="40" />
    <path d="M63.8 199.4a72 72 0 0 1 128.4 0" fill="none" />
  </Icon>
)
