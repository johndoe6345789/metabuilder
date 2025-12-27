import type { BlockDefinition } from '../types'

export const basicBlocks: BlockDefinition[] = [
  {
    type: 'log',
    label: 'Log message',
    description: 'Send a message to the Lua console',
    category: 'Basics',
    fields: [
      {
        name: 'message',
        label: 'Message',
        placeholder: '"Hello from Lua"',
        type: 'text',
        defaultValue: '"Hello from Lua"',
      },
    ],
  },
  {
    type: 'return',
    label: 'Return',
    description: 'Return a value from the script',
    category: 'Basics',
    fields: [
      {
        name: 'value',
        label: 'Value',
        placeholder: 'true',
        type: 'text',
        defaultValue: 'true',
      },
    ],
  },
  {
    type: 'comment',
    label: 'Comment',
    description: 'Add a comment to explain a step',
    category: 'Basics',
    fields: [
      {
        name: 'text',
        label: 'Comment',
        placeholder: 'Explain what happens here',
        type: 'text',
        defaultValue: 'Explain what happens here',
      },
    ],
  },
]
