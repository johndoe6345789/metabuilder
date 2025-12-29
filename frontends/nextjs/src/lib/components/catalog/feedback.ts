import type { ComponentDefinition } from '../types'

export const feedbackComponents: ComponentDefinition[] = [
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
    propSchema: [{ name: 'value', label: 'Value', type: 'number', defaultValue: 50 }],
  },
]
