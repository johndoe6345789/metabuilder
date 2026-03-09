import React from 'react'
import { Icon, IconProps } from './Icon'

export const ColumnResize = (props: IconProps) => (
  <Icon {...props}>
    <rect x="48" y="40" width="160" height="176" rx="8" />
    <line x1="128" y1="40" x2="128" y2="216" strokeDasharray="8 8" />
    <polyline points="104,88 80,128 104,168" />
    <polyline points="152,88 176,128 152,168" />
  </Icon>
)

export default ColumnResize
