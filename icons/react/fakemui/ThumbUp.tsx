import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Thumb up icon - approval/like indicator
 */
export const ThumbUp = (props: IconProps) => (
  <Icon {...props}>
    <path d="M32 112 L32 208 C32 216 38 224 48 224 L72 224 L72 112 L48 112 C38 112 32 104 32 112" />
    <path d="M72 112 L72 224 L184 224 C196 224 206 214 208 202 L224 122 C226 110 216 100 204 100 L160 100 L160 56 C160 42 150 32 136 32 L124 32 C118 32 112 38 112 44 L112 88 C112 100 104 112 88 112 Z" />
  </Icon>
)
