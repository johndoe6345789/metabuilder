import type { ComponentDefinition } from '../types'

export const inputComponents: ComponentDefinition[] = [
  {
    type: 'Button',
    label: 'Button',
    icon: 'CursorClick',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {
      children: 'Click me',
      variant: 'default',
    },
    propSchema: [
      { name: 'children', label: 'Text', type: 'string', defaultValue: 'Click me' },
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'link', label: 'Link' },
        ],
      },
      {
        name: 'size',
        label: 'Size',
        type: 'select',
        defaultValue: 'default',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'default', label: 'Default' },
          { value: 'lg', label: 'Large' },
        ],
      },
    ],
  },
  {
    type: 'Input',
    label: 'Input',
    icon: 'TextT',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text',
    },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: 'Enter text...' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        defaultValue: 'text',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'email', label: 'Email' },
          { value: 'password', label: 'Password' },
          { value: 'number', label: 'Number' },
        ],
      },
    ],
  },
  {
    type: 'Textarea',
    label: 'Textarea',
    icon: 'TextAlignLeft',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {
      placeholder: 'Enter text...',
      rows: 4,
    },
    propSchema: [
      { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: 'Enter text...' },
      { name: 'rows', label: 'Rows', type: 'number', defaultValue: 4 },
    ],
  },
  {
    type: 'Switch',
    label: 'Switch',
    icon: 'ToggleRight',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'Checkbox',
    label: 'Checkbox',
    icon: 'CheckSquare',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'Slider',
    label: 'Slider',
    icon: 'SlidersHorizontal',
    category: 'Input',
    allowsChildren: false,
    defaultProps: {
      defaultValue: [50],
      max: 100,
      step: 1,
    },
    propSchema: [
      { name: 'max', label: 'Maximum', type: 'number', defaultValue: 100 },
      { name: 'step', label: 'Step', type: 'number', defaultValue: 1 },
    ],
  },
]
