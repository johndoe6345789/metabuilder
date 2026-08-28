/**
 * M3 Component Registry
 *
 * Names the declarative JSON renderer (render-json-component) resolves component
 * `type` strings against. Previously stubbed empty ("Phase 4/5"); now populated
 * with the common M3 primitives so JSON component trees actually render. Cast to
 * the generic registry signature to sidestep per-component prop typing.
 */

'use client'

import type { ComponentType } from 'react'
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@/m3'

type AnyComp = ComponentType<Record<string, unknown>>
const c = (x: unknown): AnyComp => x as AnyComp

export const M3_REGISTRY: Record<string, AnyComp> = {
  Button: c(Button),
  Card: c(Card),
  Chip: c(Chip),
  Divider: c(Divider),
  IconButton: c(IconButton),
  List: c(List),
  ListItem: c(ListItem),
  MenuItem: c(MenuItem),
  Paper: c(Paper),
  Stack: c(Stack),
  TextField: c(TextField),
  Typography: c(Typography),
}

/** Get a component from the registry by name (null if unknown). */
export function useM3Component(name: keyof typeof M3_REGISTRY): AnyComp | null {
  return M3_REGISTRY[name] ?? null
}
