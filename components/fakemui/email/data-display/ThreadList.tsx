// fakemui/react/components/email/data-display/ThreadList.tsx
import React from 'react'
import { Box, BoxProps } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'
import { EmailCard, type EmailCardProps } from '../surfaces'

export interface ThreadListProps extends BoxProps {
  emails: Array<Omit<EmailCardProps, 'onSelect' | 'onToggleRead' | 'onToggleStar'>>
  selectedEmailId?: string
  onSelectEmail?: (emailId: string) => void
  onToggleRead?: (emailId: string, read: boolean) => void
  onToggleStar?: (emailId: string, starred: boolean) => void
  testId?: string
}

export const ThreadList = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleRead,
  onToggleStar,
  testId: customTestId,
  ...props
}: ThreadListProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'thread-list',
    identifier: customTestId || 'threads'
  })

  return (
    <Box
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
