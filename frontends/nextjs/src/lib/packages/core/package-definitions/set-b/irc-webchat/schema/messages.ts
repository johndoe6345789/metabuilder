export const createMessageArea = () => ({
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
})

export const createMessageInputArea = () => ({
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
})
