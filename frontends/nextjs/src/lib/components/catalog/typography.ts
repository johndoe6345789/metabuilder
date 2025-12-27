import type { ComponentDefinition } from '../types'

export const typographyComponents: ComponentDefinition[] = [
  {
    type: 'Label',
    label: 'Label',
    icon: 'Tag',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: {
      children: 'Label',
    },
    propSchema: [
      { name: 'children', label: 'Text', type: 'string', defaultValue: 'Label' },
    ],
  },
  {
    type: 'Heading',
    label: 'Heading',
    icon: 'TextHOne',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: {
      children: 'Heading',
      level: '1',
      className: 'text-3xl font-bold',
    },
    propSchema: [
      { name: 'children', label: 'Text', type: 'string', defaultValue: 'Heading' },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        defaultValue: '1',
        options: [
          { value: '1', label: 'H1' },
          { value: '2', label: 'H2' },
          { value: '3', label: 'H3' },
          { value: '4', label: 'H4' },
        ],
      },
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'text-3xl font-bold' },
    ],
  },
  {
    type: 'Text',
    label: 'Text',
    icon: 'Article',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: {
      children: 'Text content',
      className: '',
    },
    propSchema: [
      { name: 'children', label: 'Content', type: 'string', defaultValue: 'Text content' },
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: '' },
    ],
  },
]
