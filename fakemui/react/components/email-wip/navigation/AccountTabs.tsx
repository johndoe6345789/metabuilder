import React, { forwardRef } from 'react'
import { Tabs, Tab, TabsProps } from '..'
import { useAccessible } from '@metabuilder/fakemui/hooks'

export interface EmailAccount {
  id: string
  accountName: string
  emailAddress: string
  unreadCount?: number
}

export interface AccountTabsProps extends Omit<TabsProps, 'onChange'> {
  accounts: EmailAccount[]
  selectedAccountId?: string
  onSelectAccount?: (accountId: string) => void
  testId?: string
}

export const AccountTabs = forwardRef<HTMLDivElement, AccountTabsProps>(
  ({ accounts, selectedAccountId, onSelectAccount, testId: customTestId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'email',
      component: 'account-tabs',
      identifier: customTestId || 'accounts'
    })

    return (
      <Tabs
        ref={ref}
        value={selectedAccountId || (accounts[0]?.id ?? '')}
        onChange={(_, value) => onSelectAccount?.(value as string)}
        {...accessible}
        {...props}
      >
        {accounts.map((account) => (
          <Tab
            key={account.id}
            label={
              <span className="account-tab">
                <span className="account-name">{account.accountName}</span>
                {account.unreadCount ? (
                  <span className="unread-badge">{account.unreadCount}</span>
                ) : null}
              </span>
            }
            value={account.id}
          />
        ))}
      </Tabs>
    )
  }
)

AccountTabs.displayName = 'AccountTabs'
