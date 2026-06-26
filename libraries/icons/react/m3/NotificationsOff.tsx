import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Notifications off icon - muted bell with slash
 */
export const NotificationsOff = (props: IconProps) => (
  <Icon {...props}>
    <path d="M72 120 C72 88 92 56 128 56 C152 56 172 72 180 96" />
    <path d="M200 144 L200 104" />
    <path d="M216 176 L84 176" />
    <path d="M96 176 L96 184 C96 202 110 216 128 216 C146 216 160 202 160 184 L160 176" />
    <line x1="40" y1="40" x2="216" y2="216" strokeLinecap="round" />
  </Icon>
)
