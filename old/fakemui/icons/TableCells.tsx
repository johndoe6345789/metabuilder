import React from 'react'
import { Icon, IconProps } from './Icon'

export const TableCells = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <line x1="40" y1="88" x2="216" y2="88" />
    <line x1="40" y1="136" x2="216" y2="136" />
    <line x1="40" y1="184" x2="216" y2="184" />
    <line x1="104" y1="88" x2="104" y2="216" />
    <line x1="168" y1="88" x2="168" y2="216" />
  </Icon>
)

export default TableCells
