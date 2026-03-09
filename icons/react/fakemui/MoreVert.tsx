import React from 'react'
import { Icon, IconProps } from './Icon'

export const MoreVert = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="60" r="12" fill="currentColor" stroke="none" />
    <circle cx="128" cy="128" r="12" fill="currentColor" stroke="none" />
    <circle cx="128" cy="196" r="12" fill="currentColor" stroke="none" />
  </Icon>
)
