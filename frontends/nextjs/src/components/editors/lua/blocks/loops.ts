import type { BlockDefinition } from '../types'

export const loopBlocks: BlockDefinition[] = [
  {
    type: 'repeat',
    label: 'Repeat loop',
    description: 'Run nested blocks multiple times',
    category: 'Loops',
    fields: [
      {
        name: 'iterator',
        label: 'Iterator',
        placeholder: 'i',
        type: 'text',
        defaultValue: 'i',
      },
      {
        name: 'count',
        label: 'Times',
        placeholder: '3',
        type: 'number',
        defaultValue: '3',
      },
    ],
    hasChildren: true,
  },
]
