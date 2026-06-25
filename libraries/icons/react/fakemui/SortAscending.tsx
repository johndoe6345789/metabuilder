import React from 'react'
import { Icon, IconProps } from './Icon'

export const SortAscending = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="40" x2="128" y2="216" />
    <polyline points="56,112 128,40 200,112" />
    <line x1="40" y1="176" x2="88" y2="176" />
    <line x1="40" y1="208" x2="104" y2="208" />
    <line x1="40" y1="144" x2="72" y2="144" />
  </Icon>
)

export default SortAscending
