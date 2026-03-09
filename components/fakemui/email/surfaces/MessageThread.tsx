// fakemui/react/components/email/surfaces/MessageThread.tsx
import React from 'react'
import { Box, BoxProps, Typography, Card } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

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

export const MessageThread = ({
  messages,
  testId: customTestId,
  ...props
}: MessageThreadProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'thread',
    identifier: customTestId || 'thread'
  })

  return (
    <Box
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
