// fakemui/react/components/email/data-display/EmailHeader.tsx
import React from 'react'
import { Box, BoxProps, Typography } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'
import { StarButton } from '../atoms'

export interface EmailHeaderProps extends BoxProps {
  from: string
  to: string[]
  cc?: string[]
  subject: string
  receivedAt: number
  isStarred?: boolean
  onToggleStar?: (starred: boolean) => void
  testId?: string
}

export const EmailHeader = ({
  from,
  to,
  cc,
  subject,
  receivedAt,
  isStarred = false,
  onToggleStar,
  testId: customTestId,
  ...props
}: EmailHeaderProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'email-header',
    identifier: customTestId || subject
  })

  return (
    <Box
      className="email-header"
      {...accessible}
      {...props}
    >
      <div className="header-top">
        <Typography variant="h5" className="subject">
          {subject}
        </Typography>
        <StarButton
          isStarred={isStarred}
          onToggleStar={onToggleStar}
        />
      </div>
      <div className="header-details">
        <Typography variant="body2" className="from">
          From: <strong>{from}</strong>
        </Typography>
        <Typography variant="body2" className="to">
          To: <strong>{to.join(', ')}</strong>
        </Typography>
        {cc && cc.length > 0 && (
          <Typography variant="body2" className="cc">
            Cc: <strong>{cc.join(', ')}</strong>
          </Typography>
        )}
        <Typography variant="caption" className="date">
          {new Date(receivedAt).toLocaleString()}
        </Typography>
      </div>
    </Box>
  )
}
