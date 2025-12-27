import type { BlockDefinition } from '../types'

export const dataBlocks: BlockDefinition[] = [
  {
    type: 'set_variable',
    label: 'Set variable',
    description: 'Create or update a variable',
    category: 'Data',
    fields: [
      {
        name: 'scope',
        label: 'Scope',
        type: 'select',
        defaultValue: 'local',
        options: [
          { label: 'local', value: 'local' },
          { label: 'global', value: 'global' },
        ],
      },
      {
        name: 'name',
        label: 'Variable name',
        placeholder: 'count',
        type: 'text',
        defaultValue: 'count',
      },
      {
        name: 'value',
        label: 'Value',
        placeholder: '0',
        type: 'text',
        defaultValue: '0',
      },
    ],
  },
]
