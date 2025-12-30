import React from 'react'
import { Icon, IconProps } from './Icon'

export const SquaresFour = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="32" width="72" height="72" rx="8" />
    <rect x="152" y="32" width="72" height="72" rx="8" />
    <rect x="32" y="152" width="72" height="72" rx="8" />
    <rect x="152" y="152" width="72" height="72" rx="8" />
  </Icon>
)
