import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Notifications icon - bell with indicator dot
 */
export const Notifications = (props: IconProps) => (
  <Icon {...props}>
    <path d="M56 104 C56 64 88 32 128 32 C168 32 200 64 200 104 L200 144 L216 176 L40 176 L56 144 Z" />
    <path d="M96 176 L96 184 C96 202 110 216 128 216 C146 216 160 202 160 184 L160 176" />
    <circle cx="184" cy="64" r="20" fill="currentColor" stroke="none" />
  </Icon>
)
