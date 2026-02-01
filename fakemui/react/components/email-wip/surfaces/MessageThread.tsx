// fakemui/react/components/email/surfaces/MessageThread.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography, Card } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface MessageThreadProps extends BoxProps {
  messages: Array<{
    id: string
    from: string
    subject: string
    body: string
    receivedAt: number
    isStarred?: boolean
  }>
  testId?: string
}

export const MessageThread = forwardRef<HTMLDivElement, MessageThreadProps>(
  ({ messages, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'thread',
      identifier: customTestId || 'thread'
    })

    return (
      <Box
        ref={ref}
        className="message-thread"
        {...accessible}
        {...props}
      >
        {messages.map((message, index) => (
          <Card
            key={message.id}
            className={`message-item ${index === messages.length - 1 ? 'message-item--latest' : ''}`}
          >
            <Box className="message-header">
              <Typography variant="subtitle2">{message.from}</Typography>
              <Typography variant="caption">
                {new Date(message.receivedAt).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" className="message-body">
              {message.body}
            </Typography>
          </Card>
        ))}
      </Box>
    )
  }
)

MessageThread.displayName = 'MessageThread'
