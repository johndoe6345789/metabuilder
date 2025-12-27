import type { BlockDefinition } from '../types'

export const functionBlocks: BlockDefinition[] = [
  {
    type: 'call',
    label: 'Call function',
    description: 'Invoke a Lua function',
    category: 'Functions',
    fields: [
      {
        name: 'function',
        label: 'Function name',
        placeholder: 'my_function',
        type: 'text',
        defaultValue: 'my_function',
      },
      {
        name: 'args',
        label: 'Arguments',
        placeholder: 'context.data',
        type: 'text',
        defaultValue: 'context.data',
      },
    ],
  },
]
