import React from 'react'
import { Icon, IconProps } from './Icon'

export const Science = (props: IconProps) => (
  <Icon {...props}>
    <path d="M168 56V32H88v24l-64 104a24 24 0 0 0 20.5 36h167a24 24 0 0 0 20.5-36Z" />
    <circle cx="100" cy="148" r="12" fill="currentColor" />
    <circle cx="148" cy="128" r="8" fill="currentColor" />
    <circle cx="128" cy="168" r="10" fill="currentColor" />
  </Icon>
)
