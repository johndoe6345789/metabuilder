import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Schedule icon - clock with appointment marks
 */
export const Schedule = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <polyline points="128 72 128 128 176 128" />
    <line x1="128" y1="32" x2="128" y2="48" />
    <line x1="128" y1="208" x2="128" y2="224" />
    <line x1="32" y1="128" x2="48" y2="128" />
    <line x1="208" y1="128" x2="224" y2="128" />
  </Icon>
)
