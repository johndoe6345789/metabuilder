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
  selected?: boolean
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
  selected,
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

  const date = new Date(receivedAt)
  const today = new Date()
  const isToday =
    date.toDateString() === today.toDateString()
  const displayDate = isToday
    ? date.toLocaleTimeString(
        [], { hour: '2-digit', minute: '2-digit' }
      )
    : date.toLocaleDateString(
        [], { month: 'short', day: 'numeric' }
      )

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.()
    }
  }

  return (
    <Card
      role="article"
      aria-label={`Email from ${from}: ${subject}`}
      aria-current={selected ? 'true' : undefined}
      tabIndex={0}
      className={
        `email-card ${isRead
          ? 'email-card--read'
          : 'email-card--unread'}`
      }
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      {...accessible}
      {...props}
    >
      <Box className="email-card-header">
        <MarkAsReadCheckbox
          isRead={isRead}
          onToggleRead={onToggleRead}
          onClick={(e) => e.stopPropagation()}
        />
        <Typography
          variant="subtitle2"
          className="email-from"
        >
          {from}
        </Typography>
        <div className="email-card-actions">
          <StarButton
            isStarred={isStarred}
            onToggleStar={onToggleStar}
            onClick={(e) => e.stopPropagation()}
          />
          <time dateTime={date.toISOString()}>
            <Typography
              variant="caption"
              className="email-date"
            >
              {displayDate}
            </Typography>
          </time>
        </div>
      </Box>
      <Typography
        variant="h6"
        className="email-subject"
      >
        {subject}
      </Typography>
      <Typography
        variant="body2"
        className="email-preview"
        noWrap
      >
        {preview}
      </Typography>
    </Card>
  )
}
