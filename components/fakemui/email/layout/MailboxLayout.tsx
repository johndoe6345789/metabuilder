// fakemui/react/components/email/layout/MailboxLayout.tsx
import React from 'react'
import { Box, BoxProps, AppBar, Toolbar } from '../..'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface MailboxLayoutProps extends BoxProps {
  sidebar: React.ReactNode
  main: React.ReactNode
  detail?: React.ReactNode
  header?: React.ReactNode
  testId?: string
}

export const MailboxLayout = ({
  sidebar,
  main,
  detail,
  header,
  testId: customTestId,
  ...props
}: MailboxLayoutProps) => {
  const accessible = useAccessible({
    feature: 'email',
    component: 'mailbox-layout',
    identifier: customTestId || 'mailbox'
  })

  return (
    <Box
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
