import type { ComponentDefinition } from '../types'

export const displayComponents: ComponentDefinition[] = [
  {
    type: 'Card',
    label: 'Card',
    icon: 'Card',
    category: 'Display',
    allowsChildren: true,
    defaultProps: {
      className: 'p-6',
    },
    propSchema: [{ name: 'className', label: 'CSS Classes', type: 'string', defaultValue: 'p-6' }],
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
    type: 'Separator',
    label: 'Separator',
    icon: 'Minus',
    category: 'Display',
    allowsChildren: false,
    defaultProps: {},
    propSchema: [],
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
