/** M3 components a vault-tree node may name directly. */

import type { ComponentType } from 'react'
import { Alert, Button, Chip, Paper, TextField, Typography } from '@/m3'

type M3Component = ComponentType<Record<string, unknown>>

export const PRIMITIVES: Record<string, M3Component> = {
  Alert: Alert as M3Component,
  Chip: Chip as M3Component,
  Button: Button as M3Component,
  Paper: Paper as M3Component,
  TextField: TextField as M3Component,
  Typography: Typography as M3Component,
}

/** Plain HTML elements a node may render directly, with text and props. */
export const NATIVE_ELEMENTS = new Set([
  'div',
  'header',
  'button',
  'strong',
  'span',
])
