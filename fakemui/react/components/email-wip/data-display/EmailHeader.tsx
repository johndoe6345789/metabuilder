// fakemui/react/components/email/data-display/EmailHeader.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps, Typography } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
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

export const EmailHeader = forwardRef<HTMLDivElement, EmailHeaderProps>(
  (
    {
      from,
      to,
      cc,
      subject,
      receivedAt,
      isStarred = false,
      onToggleStar,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'email-header',
      identifier: customTestId || subject
    })

    return (
      <Box
        ref={ref}
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
)

EmailHeader.displayName = 'EmailHeader'
