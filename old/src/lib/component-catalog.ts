import type { ComponentDefinition } from './builder-types'

export const componentCatalog: ComponentDefinition[] = [
  {
    type: 'Container',
    label: 'Container',
    icon: 'FrameCorners',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {
      className: 'p-4',
    },
    propSchema: [
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'p-4' },
    ],
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
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'grid grid-cols-2 gap-4' },
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
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'flex flex-col gap-2' },
    ],
  },
  {
    type: 'Card',
    label: 'Card',
    icon: 'Card',
    category: 'Display',
    allowsChildren: true,
    defaultProps: {
      className: 'p-6',
    },
    propSchema: [
      { name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'p-6' },
    ],
  },
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
  {
    type: 'Badge',
    label: 'Badge',
    icon: 'Seal',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {
      children: 'Badge',
      variant: 'default',
    },
    propSchema: [
      { name: 'children', label: 'Text', type: 'string', defaultValue: 'Badge' },
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
        ],
      },
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
    type: 'Separator',
    label: 'Separator',
    icon: 'Minus',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'Alert',
    label: 'Alert',
    icon: 'Warning',
    category: 'Feedback',
    allowsChildren: true,
    defaultProps: {
      variant: 'default',
    },
    propSchema: [
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'destructive', label: 'Destructive' },
        ],
      },
    ],
  },
  {
    type: 'Progress',
    label: 'Progress',
    icon: 'CircleNotch',
    category: 'Feedback',
    allowsChildren: false,
    defaultProps: {
      value: 50,
    },
    propSchema: [
      { name: 'value', label: 'Value', type: 'number', defaultValue: 50 },
    ],
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
  {
    type: 'Avatar',
    label: 'Avatar',
    icon: 'UserCircle',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'Table',
    label: 'Table',
    icon: 'Table',
    category: 'Data',
    allowsChildren: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'IRCWebchat',
    label: 'IRC Webchat',
    icon: 'Chat',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {
      channelName: 'general',
    },
    propSchema: [
      { name: 'channelName', label: 'Channel Name', type: 'string', defaultValue: 'general' },
    ],
  },
]
