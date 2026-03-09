import React from 'react'
import { Icon, IconProps } from './Icon'

export const Columns = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="48" height="176" rx="8" />
    <rect x="104" y="40" width="48" height="176" rx="8" />
    <rect x="168" y="40" width="48" height="176" rx="8" />
  </Icon>
)

export default Columns
