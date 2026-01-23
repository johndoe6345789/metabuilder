// fakemui/react/components/email/layout/MailboxLayout.tsx
import React, { forwardRef } from 'react'
import { Box, type BoxProps } 
import { AppBar, Toolbar } 
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface MailboxLayoutProps extends BoxProps {
  sidebar: React.ReactNode
  main: React.ReactNode
  detail?: React.ReactNode
  header?: React.ReactNode
  testId?: string
}

export const MailboxLayout = forwardRef<HTMLDivElement, MailboxLayoutProps>(
  ({ sidebar, main, detail, header, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'mailbox-layout',
      identifier: customTestId || 'mailbox'
    })

    return (
      <Box
        ref={ref}
        className="mailbox-layout"
        {...accessible}
        {...props}
      >
        {header && (
          <AppBar position="static" className="mailbox-header">
            <Toolbar>{header}</Toolbar>
          </AppBar>
        )}
        <Box className="mailbox-content">
          <aside className="mailbox-sidebar">{sidebar}</aside>
          <main className="mailbox-main">{main}</main>
          {detail && <article className="mailbox-detail">{detail}</article>}
        </Box>
      </Box>
    )
  }
)

MailboxLayout.displayName = 'MailboxLayout'
