import type { JSX } from 'react'

import { ArrowRight, Code, GitBranch, Lightning } from '@/fakemui/icons'

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
  trigger: <Lightning size={16} />,
  action: <ArrowRight size={16} />,
  condition: <GitBranch size={16} />,
  lua: <Code size={16} />,
  transform: <ArrowRight size={16} />,
}

export const NODE_TYPE_COLORS: Record<WorkflowNode['type'], string> = {
  trigger: 'success.main',
  action: 'primary.main',
  condition: 'warning.main',
  lua: 'secondary.main',
  transform: 'info.main',
}
