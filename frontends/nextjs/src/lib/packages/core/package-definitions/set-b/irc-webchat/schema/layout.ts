import { createMessageArea, createMessageInputArea } from './messages'

const createHeaderSection = () => ({
  id: 'header',
  type: 'CardHeader',
  props: {
    className: 'border-b border-border pb-3',
  },
  children: [
    {
      id: 'title_container',
      type: 'Flex',
      props: {
        className: 'flex items-center justify-between',
      },
      children: [
        {
          id: 'title',
          type: 'CardTitle',
          props: {
            className: 'flex items-center gap-2 text-lg',
            content: '#{channelName}',
          },
        },
        {
          id: 'actions',
          type: 'Flex',
          props: {
            className: 'flex items-center gap-2',
          },
          children: [
            {
              id: 'user_badge',
              type: 'Badge',
              props: {
                variant: 'secondary',
                className: 'gap-1.5',
                icon: 'Users',
                content: '{onlineUsersCount}',
              },
            },
            {
              id: 'settings_button',
              type: 'Button',
              props: {
                size: 'sm',
                variant: 'ghost',
                icon: 'Gear',
                onClick: 'toggleSettings',
              },
            },
          ],
        },
      ],
    },
  ],
})

const createSidebar = () => ({
  id: 'sidebar',
  type: 'Container',
  props: {
    className: 'w-48 border-l border-border p-4 bg-muted/20',
    conditional: 'showSettings',
  },
  children: [
    {
      id: 'sidebar_title',
      type: 'Heading',
      props: {
        level: '4',
        className: 'font-semibold text-sm mb-3',
        content: 'Online Users',
      },
    },
    {
      id: 'users_list',
      type: 'UserList',
      props: {
        className: 'space-y-1.5 text-sm',
        dataSource: 'onlineUsers',
      },
    },
  ],
})

export const ircWebchatComponentConfig = {
  type: 'IRCWebchat',
  category: 'social',
  label: 'IRC Webchat',
  description: 'IRC-style chat component with channels and commands',
  icon: '💬',
  props: [
    {
      name: 'channelName',
      type: 'string',
      label: 'Channel Name',
      defaultValue: 'general',
      required: false,
    },
    {
      name: 'showSettings',
      type: 'boolean',
      label: 'Show Settings',
      defaultValue: false,
      required: false,
    },
    {
      name: 'height',
      type: 'string',
      label: 'Height',
      defaultValue: '600px',
      required: false,
    },
  ],
  config: {
    layout: 'Card',
    styling: {
      className: 'h-[600px] flex flex-col',
    },
    children: [
      createHeaderSection(),
      {
        id: 'content',
        type: 'CardContent',
        props: {
          className: 'flex-1 flex flex-col p-0 overflow-hidden',
        },
        children: [
          {
            id: 'main_area',
            type: 'Flex',
            props: {
              className: 'flex flex-1 overflow-hidden',
            },
            children: [createMessageArea(), createSidebar()],
          },
          createMessageInputArea(),
        ],
      },
    ],
  },
}
