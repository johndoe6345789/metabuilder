import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Drag indicator icon - 6-dot drag handle for sortable items
 */
export const DragIndicator = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="96" cy="64" r="12" fill="currentColor" />
    <circle cx="160" cy="64" r="12" fill="currentColor" />
    <circle cx="96" cy="128" r="12" fill="currentColor" />
    <circle cx="160" cy="128" r="12" fill="currentColor" />
    <circle cx="96" cy="192" r="12" fill="currentColor" />
    <circle cx="160" cy="192" r="12" fill="currentColor" />
  </Icon>
)
