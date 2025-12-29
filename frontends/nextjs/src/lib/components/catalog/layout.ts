import type { ComponentDefinition } from '../types'

export const layoutComponents: ComponentDefinition[] = [
  {
    type: 'Container',
    label: 'Container',
    icon: 'FrameCorners',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {
      className: 'p-4',
    },
    propSchema: [{ name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'p-4' }],
  },
  {
    type: 'Flex',
    label: 'Flex Box',
    icon: 'Columns',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {
      className: 'flex gap-4',
    },
    propSchema: [
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'flex gap-4' },
    ],
  },
  {
    type: 'Grid',
    label: 'Grid',
    icon: 'GridFour',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {
      className: 'grid grid-cols-2 gap-4',
    },
    propSchema: [
      {
        name: 'className',
        label: 'CSS Classes',
        type: 'string',
        defaultValue: 'grid grid-cols-2 gap-4',
      },
    ],
  },
  {
    type: 'Stack',
    label: 'Stack',
    icon: 'Stack',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {
      className: 'flex flex-col gap-2',
    },
    propSchema: [
      {
        name: 'className',
        label: 'CSS Classes',
        type: 'string',
        defaultValue: 'flex flex-col gap-2',
      },
    ],
  },
]
