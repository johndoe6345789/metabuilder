import React from 'react'
import { Icon, IconProps } from './Icon'

export const RadioButtonChecked = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="88" />
    <circle cx="128" cy="128" r="48" fill="currentColor" stroke="none" />
  </Icon>
)
