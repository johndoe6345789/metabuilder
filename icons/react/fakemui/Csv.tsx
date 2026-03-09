import React from 'react'
import { Icon, IconProps } from './Icon'

export const Csv = (props: IconProps) => (
  <Icon {...props}>
    <path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z" />
    <polyline points="152,32 152,88 208,88" />
    <text x="76" y="168" fontSize="48" fontFamily="monospace" fill="currentColor" stroke="none">CSV</text>
  </Icon>
)

export default Csv
