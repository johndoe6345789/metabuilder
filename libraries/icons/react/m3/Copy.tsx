import React from 'react'
import { Icon, IconProps } from './Icon'

export const Copy = (props: IconProps) => (
  <Icon {...props}>
    <rect x="88" y="88" width="128" height="128" rx="8" />
    <path d="M168,168V48a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88" />
  </Icon>
)
