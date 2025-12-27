import type { BlockDefinition } from '../types'

export const logicBlocks: BlockDefinition[] = [
  {
    type: 'if',
    label: 'If',
    description: 'Run blocks when a condition is true',
    category: 'Logic',
    fields: [
      {
        name: 'condition',
        label: 'Condition',
        placeholder: 'context.data.isActive',
        type: 'text',
        defaultValue: 'context.data.isActive',
      },
    ],
    hasChildren: true,
  },
  {
    type: 'if_else',
    label: 'If / Else',
    description: 'Branch execution with else fallback',
    category: 'Logic',
    fields: [
      {
        name: 'condition',
        label: 'Condition',
        placeholder: 'context.data.count > 5',
        type: 'text',
        defaultValue: 'context.data.count > 5',
      },
    ],
    hasChildren: true,
    hasElseChildren: true,
  },
]
