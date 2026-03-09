import React from 'react'
import { Icon, IconProps } from './Icon'

export const ColorPicker = (props: IconProps) => (
  <Icon {...props}>
    <path d="M176 80l-16-16 64-24-24 64-16-16-48 48" fill="none" />
    <path d="M64 176l48-48 24 24-48 48-36 12z" fill="none" />
  </Icon>
)
