// fakemui/react/components/email/data-display/ThreadList.tsx
import React from 'react'
import { Box, BoxProps } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'
import { EmailCard, type EmailCardProps } from '../surfaces'

export interface ThreadListProps extends BoxProps {
  emails: Array<Omit<
    EmailCardProps,
    'onSelect' | 'onToggleRead' | 'onToggleStar'
  >>
  selectedEmailId?: string
  onSelectEmail?: (emailId: string) => void
  onToggleRead?: (id: string, read: boolean) => void
  onToggleStar?: (id: string, star: boolean) => void
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

  const emailId = (e: typeof emails[0], i: number) =>
    e.testId || `email-${i}`

  return (
    <Box
      role="list"
      aria-label="Email messages"
      className="thread-list"
      {...accessible}
      {...props}
    >
      {emails.length === 0 ? (
        <div className="no-emails" role="status">
          No emails
        </div>
      ) : (
        emails.map((email, idx) => (
          <div role="listitem" key={idx}>
            <EmailCard
              {...email}
              selected={
                selectedEmailId === email.testId
              }
              onSelect={() =>
                onSelectEmail?.(emailId(email, idx))
              }
              onToggleRead={(read) =>
                onToggleRead?.(
                  emailId(email, idx), read
                )
              }
              onToggleStar={(starred) =>
                onToggleStar?.(
                  emailId(email, idx), starred
                )
              }
            />
          </div>
        ))
      )}
    </Box>
  )
}
