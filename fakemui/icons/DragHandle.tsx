import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Drag handle icon - horizontal lines for draggable areas
 */
export const DragHandle = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="104" x2="216" y2="104" strokeLinecap="round" />
    <line x1="40" y1="152" x2="216" y2="152" strokeLinecap="round" />
  </Icon>
)
