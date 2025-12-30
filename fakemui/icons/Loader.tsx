import React from 'react'
import { Icon, IconProps } from './Icon'

export const Loader = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="32" x2="128" y2="64" />
    <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" />
    <line x1="224" y1="128" x2="192" y2="128" />
    <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" />
    <line x1="128" y1="224" x2="128" y2="192" />
    <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" />
    <line x1="32" y1="128" x2="64" y2="128" />
    <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" />
  </Icon>
)
