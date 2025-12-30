import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Tune icon - sliders for settings/filters
 */
export const Tune = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="64" x2="216" y2="64" />
    <line x1="40" y1="128" x2="216" y2="128" />
    <line x1="40" y1="192" x2="216" y2="192" />
    <circle cx="80" cy="64" r="16" fill="currentColor" />
    <circle cx="176" cy="128" r="16" fill="currentColor" />
    <circle cx="112" cy="192" r="16" fill="currentColor" />
  </Icon>
)
