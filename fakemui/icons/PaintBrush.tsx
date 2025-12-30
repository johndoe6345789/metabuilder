import React from 'react'
import { Icon, IconProps } from './Icon'

export const PaintBrush = (props: IconProps) => (
  <Icon {...props}>
    <path d="M64 136h88a48 48 0 0 0 48-48V48H72a48 48 0 0 0-48 48v40a40 40 0 0 0 40 40Z" />
    <line x1="128" y1="136" x2="128" y2="232" />
    <circle cx="128" cy="200" r="24" fill="none" />
  </Icon>
)
