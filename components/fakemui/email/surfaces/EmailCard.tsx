// fakemui/react/components/email/surfaces/EmailCard.tsx
import React from 'react'
import { Card, CardProps, Box, Typography } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'
import { MarkAsReadCheckbox, StarButton } from '../atoms'

export interface EmailCardProps extends CardProps {
  from: string
  subject: string
  preview: string
  receivedAt: number
  isRead: boolean
  isStarred?: boolean
  onSelect?: () => void
  onToggleRead?: (read: boolean) => void
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const EmailCard = ({
  from,
  subject,
  preview,
  receivedAt,
  isRead,
  isStarred = false,
  onSelect,
  onToggleRead,
  onToggleStar,
  testId: customTestId,
  ...props
}: EmailCardProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'card',
    identifier: customTestId || subject.substring(0, 20)
  })

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <Card
      className={`email-card ${isRead ? 'email-card--read' : 'email-card--unread'}`}
      onClick={onSelect}
      {...accessible}
      {...props}
    >
      <Box className="email-card-header">
        <MarkAsReadCheckbox
          isRead={isRead}
          onToggleRead={onToggleRead}
          onClick={(e) => e.stopPropagation()}
        />
        <Typography variant="subtitle2" className="email-from">
          {from}
        </Typography>
        <div className="email-card-actions">
          <StarButton
            isStarred={isStarred}
            onToggleStar={onToggleStar}
            onClick={(e) => e.stopPropagation()}
          />
          <Typography variant="caption" className="email-date">
            {formatDate(receivedAt)}
          </Typography>
        </div>
      </Box>
      <Typography variant="h6" className="email-subject">
        {subject}
      </Typography>
      <Typography variant="body2" className="email-preview" noWrap>
        {preview}
      </Typography>
    </Card>
  )
}
