import {
  AccountTree as GitBranchIcon,
  ArrowForward as ArrowRightIcon,
  Code as CodeIcon,
  FlashOn as LightningIcon,
} from '@mui/icons-material'
import type { JSX } from 'react'

import type { WorkflowNode } from '@/lib/level-types'

import type { NodeTypeOption } from './types'

export const DEFAULT_TEST_DATA = '{"example": "data"}'

export const NODE_TYPE_OPTIONS: NodeTypeOption[] = [
  { type: 'trigger', label: 'Trigger' },
  { type: 'action', label: 'Action' },
  { type: 'condition', label: 'Condition' },
  { type: 'lua', label: 'Lua Script' },
  { type: 'transform', label: 'Transform' },
]

export const NODE_TYPE_ICONS: Record<WorkflowNode['type'], JSX.Element> = {
  trigger: <LightningIcon fontSize="small" />,
  action: <ArrowRightIcon fontSize="small" />,
  condition: <GitBranchIcon fontSize="small" />,
  lua: <CodeIcon fontSize="small" />,
  transform: <ArrowRightIcon fontSize="small" />,
}

export const NODE_TYPE_COLORS: Record<WorkflowNode['type'], string> = {
  trigger: 'success.main',
  action: 'primary.main',
  condition: 'warning.main',
  lua: 'secondary.main',
  transform: 'info.main',
}
