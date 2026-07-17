import type { ComponentDef } from './types'

export const COMPONENT_CATALOG: ComponentDef[] = [
  // Layout
  {
    type: 'Container',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: {},
    propSchema: [],
  },
  {
    type: 'FlexRow',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: { gap: '8' },
    propSchema: [
      { name: 'gap', type: 'string' },
      { name: 'align', type: 'select',
        options: ['flex-start', 'center', 'flex-end', 'stretch'] },
      { name: 'justify', type: 'select',
        options: ['flex-start', 'center', 'flex-end',
          'space-between', 'space-around'] },
    ],
  },
  {
    type: 'Grid',
    category: 'Layout',
    allowsChildren: true,
    defaultProps: { columns: '2' },
    propSchema: [
      { name: 'columns', type: 'number' },
      { name: 'gap', type: 'string' },
    ],
  },
  // Input
  {
    type: 'Button',
    category: 'Input',
    allowsChildren: false,
    defaultProps: { label: 'Click me', variant: 'primary' },
    propSchema: [
      { name: 'label', type: 'string' },
      {
        name: 'variant',
        type: 'select',
        options: ['primary', 'secondary', 'outlined'],
      },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  {
    type: 'TextField',
    category: 'Input',
    allowsChildren: false,
    defaultProps: { label: 'Label', placeholder: '' },
    propSchema: [
      { name: 'label', type: 'string' },
      { name: 'placeholder', type: 'string' },
      { name: 'required', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  {
    type: 'Switch',
    category: 'Input',
    allowsChildren: false,
    defaultProps: { label: 'Toggle' },
    propSchema: [
      { name: 'label', type: 'string' },
      { name: 'defaultChecked', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  // Typography
  {
    type: 'Heading',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: { text: 'Heading', level: '2' },
    propSchema: [
      { name: 'text', type: 'string' },
      {
        name: 'level',
        type: 'select',
        options: ['1', '2', '3', '4', '5', '6'],
      },
    ],
  },
  {
    type: 'Text',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: { text: 'Some text' },
    propSchema: [{ name: 'text', type: 'string' }],
  },
  {
    type: 'Label',
    category: 'Typography',
    allowsChildren: false,
    defaultProps: { text: 'Label' },
    propSchema: [{ name: 'text', type: 'string' }],
  },
  // Display
  {
    type: 'Card',
    category: 'Display',
    allowsChildren: true,
    defaultProps: {},
    propSchema: [
      { name: 'title', type: 'string' },
      { name: 'subtitle', type: 'string' },
    ],
  },
  {
    type: 'Badge',
    category: 'Display',
    allowsChildren: false,
    defaultProps: { label: 'New', variant: 'default' },
    propSchema: [
      { name: 'label', type: 'string' },
      {
        name: 'variant',
        type: 'select',
        options: ['default', 'primary', 'error'],
      },
    ],
  },
  {
    type: 'Avatar',
    category: 'Display',
    allowsChildren: false,
    defaultProps: { fallback: 'AB' },
    propSchema: [
      { name: 'fallback', type: 'string' },
      { name: 'src', type: 'string' },
    ],
  },
  {
    type: 'Divider',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
  },
  // Feedback
  {
    type: 'Alert',
    category: 'Feedback',
    allowsChildren: false,
    defaultProps: { message: 'Alert message', severity: 'info' },
    propSchema: [
      { name: 'message', type: 'string' },
      {
        name: 'severity',
        type: 'select',
        options: ['info', 'success', 'warning', 'error'],
      },
    ],
  },
  {
    type: 'Progress',
    category: 'Feedback',
    allowsChildren: false,
    defaultProps: { value: 50 },
    propSchema: [{ name: 'value', type: 'number' }],
  },
]
