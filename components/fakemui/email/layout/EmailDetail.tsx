import React from 'react'
import { Box, BoxProps, Button, IconButton } from '../..'
import { MaterialIcon } from '../../../../icons/react/fakemui'
import { useAccessible } from '../../../../hooks/useAccessible'
import { EmailHeader } from '../data-display'

export interface EmailDetailEmail {
  id: string
  from: string
  to: string[]
  cc?: string[]
  subject: string
  body: string
  receivedAt: number
  isStarred: boolean
}

export interface EmailDetailProps extends BoxProps {
  email: EmailDetailEmail
  onClose?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onReply?: () => void
  onForward?: () => void
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const EmailDetail = ({
  email,
  onClose,
  onArchive,
  onDelete,
  onReply,
  onForward,
  onToggleStar,
  testId: customTestId,
  ...props
}: EmailDetailProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'email-detail',
    identifier: customTestId || 'detail'
  })

  return (
    <Box
      role="article"
      aria-label={email.subject}
      className="email-detail"
      {...accessible}
      {...props}
    >
      <Box
        id="email-detail-toolbar"
        className="email-detail-toolbar"
      >
        {onClose && (
          <IconButton
            aria-label="Back to list"
            data-testid="email-back"
            onClick={onClose}
          >
            <MaterialIcon name="arrow_back" size={20} />
          </IconButton>
        )}
        <Box className="email-detail-actions">
          {onArchive && (
            <IconButton
              aria-label="Archive"
              title="Archive"
              data-testid="email-archive"
              onClick={onArchive}
            >
              <MaterialIcon name="archive" size={20} />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              aria-label="Delete"
              title="Delete"
              data-testid="email-delete"
              onClick={onDelete}
            >
              <MaterialIcon name="delete" size={20} />
            </IconButton>
          )}
          {onReply && (
            <IconButton
              aria-label="Reply"
              title="Reply"
              data-testid="email-reply"
              onClick={onReply}
            >
              <MaterialIcon name="reply" size={20} />
            </IconButton>
          )}
          {onForward && (
            <IconButton
              aria-label="Forward"
              title="Forward"
              data-testid="email-forward"
              onClick={onForward}
            >
              <MaterialIcon name="forward" size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      <EmailHeader
        from={email.from}
        to={email.to}
        cc={email.cc}
        subject={email.subject}
        receivedAt={email.receivedAt}
        isStarred={email.isStarred}
        onToggleStar={onToggleStar}
      />

      <Box
        id="email-detail-body"
        className="email-detail-body"
      >
        {email.body}
      </Box>

      <Box
        id="email-detail-reply-bar"
        className="email-detail-reply-bar"
      >
        {onReply && (
          <Button
            variant="outlined"
            data-testid="email-reply-btn"
            onClick={onReply}
          >
            <MaterialIcon name="reply" size={16} />
            Reply
          </Button>
        )}
        {onForward && (
          <Button
            variant="outlined"
            data-testid="email-forward-btn"
            onClick={onForward}
          >
            <MaterialIcon name="forward" size={16} />
            Forward
          </Button>
        )}
      </Box>
    </Box>
  )
}
