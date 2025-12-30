import React from 'react'
import { Icon, IconProps } from './Icon'

export const BugReport = (props: IconProps) => (
  <Icon {...props}>
    <path d="M176 96 C176 78.3 161.7 64 144 64 L112 64 C94.3 64 80 78.3 80 96 L80 160 C80 186.5 101.5 208 128 208 C154.5 208 176 186.5 176 160 Z" />
    <line x1="80" y1="128" x2="40" y2="128" />
    <line x1="176" y1="128" x2="216" y2="128" />
    <line x1="88" y1="64" x2="64" y2="40" />
    <line x1="168" y1="64" x2="192" y2="40" />
    <line x1="80" y1="176" x2="56" y2="200" />
    <line x1="176" y1="176" x2="200" y2="200" />
    <line x1="80" y1="96" x2="176" y2="96" />
    <line x1="80" y1="160" x2="176" y2="160" />
  </Icon>
)
