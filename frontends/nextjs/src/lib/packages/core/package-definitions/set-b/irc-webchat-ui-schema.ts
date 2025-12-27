import type { PackageContent } from '../../package-types'

type IrcWebchatUiSchema = Pick<PackageContent, 'pages' | 'componentHierarchy' | 'componentConfigs'>

export const createIrcWebchatUiSchema = (): IrcWebchatUiSchema => ({
  pages: [
    {
      id: 'page_chat',
      path: '/chat',
      title: 'IRC Webchat',
      level: 2,
      componentTree: [
        {
          id: 'comp_chat_root',
          type: 'IRCWebchat',
          props: {
            channelName: 'general',
          },
          children: [],
        },
      ],
      requiresAuth: true,
      requiredRole: 'user',
    },
  ],
  componentHierarchy: {
    page_chat: {
      id: 'comp_chat_root',
      type: 'IRCWebchat',
      props: {},
      children: [],
    },
  },
  componentConfigs: {
    IRCWebchat: {
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
          {
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
          },
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
                children: [
                  {
                    id: 'messages_area',
                    type: 'ScrollArea',
                    props: {
                      className: 'flex-1 p-4',
                    },
                    children: [
                      {
                        id: 'messages_container',
                        type: 'MessageList',
                        props: {
                          className: 'space-y-2 font-mono text-sm',
                          dataSource: 'messages',
                          itemRenderer: 'renderMessage',
                        },
                      },
                    ],
                  },
                  {
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
                  },
                ],
              },
              {
                id: 'input_area',
                type: 'Container',
                props: {
                  className: 'border-t border-border p-4',
                },
                children: [
                  {
                    id: 'input_row',
                    type: 'Flex',
                    props: {
                      className: 'flex gap-2',
                    },
                    children: [
                      {
                        id: 'message_input',
                        type: 'Input',
                        props: {
                          className: 'flex-1 font-mono',
                          placeholder: 'Type a message... (/help for commands)',
                          onKeyPress: 'handleKeyPress',
                          value: '{inputMessage}',
                          onChange: 'updateInputMessage',
                        },
                      },
                      {
                        id: 'send_button',
                        type: 'Button',
                        props: {
                          size: 'icon',
                          icon: 'PaperPlaneTilt',
                          onClick: 'handleSendMessage',
                        },
                      },
                    ],
                  },
                  {
                    id: 'help_text',
                    type: 'Text',
                    props: {
                      className: 'text-xs text-muted-foreground mt-2',
                      content: 'Press Enter to send. Type /help for commands.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
})
