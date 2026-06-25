import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Thumb down icon - disapproval/dislike indicator
 */
export const ThumbDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="M32 144 L32 48 C32 40 38 32 48 32 L72 32 L72 144 L48 144 C38 144 32 152 32 144" />
    <path d="M72 144 L72 32 L184 32 C196 32 206 42 208 54 L224 134 C226 146 216 156 204 156 L160 156 L160 200 C160 214 150 224 136 224 L124 224 C118 224 112 218 112 212 L112 168 C112 156 104 144 88 144 Z" />
  </Icon>
)
