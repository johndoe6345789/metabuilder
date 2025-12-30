import React from 'react'
import { Icon, IconProps } from './Icon'

export const Grip = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="80" cy="72" r="12" fill="currentColor" />
    <circle cx="80" cy="128" r="12" fill="currentColor" />
    <circle cx="80" cy="184" r="12" fill="currentColor" />
    <circle cx="176" cy="72" r="12" fill="currentColor" />
    <circle cx="176" cy="128" r="12" fill="currentColor" />
    <circle cx="176" cy="184" r="12" fill="currentColor" />
  </Icon>
)
