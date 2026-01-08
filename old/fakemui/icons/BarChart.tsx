import React from 'react'
import { Icon, IconProps } from './Icon'

export const BarChart = (props: IconProps) => (
  <Icon {...props}>
    <rect x="48" y="144" width="40" height="80" />
    <rect x="108" y="96" width="40" height="128" />
    <rect x="168" y="48" width="40" height="176" />
  </Icon>
)
