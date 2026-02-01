// fakemui/react/components/email/data-display/ThreadList.tsx
import React, { forwardRef } from 'react'
import { Box, BoxProps } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'
import { EmailCard, type EmailCardProps } from '../surfaces'

export interface ThreadListProps extends BoxProps {
  emails: Array<Omit<EmailCardProps, 'onSelect' | 'onToggleRead' | 'onToggleStar' | 'ref'>>
  selectedEmailId?: string
  onSelectEmail?: (emailId: string) => void
  onToggleRead?: (emailId: string, read: boolean) => void
  onToggleStar?: (emailId: string, starred: boolean) => void
  testId?: string
}

export const ThreadList = forwardRef<HTMLDivElement, ThreadListProps>(
  (
    {
      emails,
      selectedEmailId,
      onSelectEmail,
      onToggleRead,
      onToggleStar,
      testId: customTestId,
      ...props
    },
    ref
  ) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'thread-list',
      identifier: customTestId || 'threads'
    })

    return (
      <Box
        ref={ref}
        className="thread-list"
        {...accessible}
        {...props}
      >
        {emails.length === 0 ? (
          <div className="no-emails">No emails</div>
        ) : (
          emails.map((email, idx) => (
            <EmailCard
              key={idx}
              {...email}
              onSelect={() => onSelectEmail?.(email.testId || `email-${idx}`)}
              onToggleRead={(read) => onToggleRead?.(email.testId || `email-${idx}`, read)}
              onToggleStar={(starred) => onToggleStar?.(email.testId || `email-${idx}`, starred)}
            />
          ))
        )}
      </Box>
    )
  }
)

ThreadList.displayName = 'ThreadList'
