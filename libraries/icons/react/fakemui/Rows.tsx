import React from 'react'
import { Icon, IconProps } from './Icon'

export const Rows = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="48" rx="8" />
    <rect x="40" y="104" width="176" height="48" rx="8" />
    <rect x="40" y="168" width="176" height="48" rx="8" />
  </Icon>
)

export default Rows
