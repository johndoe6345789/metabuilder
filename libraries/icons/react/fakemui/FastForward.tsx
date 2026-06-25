import React from 'react'
import { Icon, IconProps } from './Icon'

export const FastForward = (props: IconProps) => (
  <Icon {...props}>
    <polygon points="32,64 128,128 32,192" />
    <polygon points="128,64 224,128 128,192" />
  </Icon>
)
