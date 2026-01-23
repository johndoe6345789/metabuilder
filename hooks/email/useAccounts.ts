import { useState, useCallback, useEffect } from 'react'

/**
 * Email account configuration
 */
export interface EmailAccount {
  id: string
  accountName: string
  emailAddress: string
  protocol: 'imap' | 'pop3'
  hostname: string
  port: number
  encryption: 'none' | 'tls' | 'starttls'
  username: string
  isSyncEnabled: boolean
  syncInterval: number
  lastSyncAt: number | null
  isSyncing: boolean
  isEnabled: boolean
  unreadCount: number
  totalCount: number
}

/**
 * Hook to get email accounts for current user
 * Manages account list, creation, and deletion
 */
export interface UseAccountsResult {
  /** List of email accounts */
  accounts: EmailAccount[]
  /** Whether accounts are being loaded */
  loading: boolean
  /** Error loading accounts */
  error: Error | null
  /** Add a new email account */
  addAccount: (account: Omit<EmailAccount, 'id' | 'unreadCount' | 'totalCount'>) => Promise<EmailAccount>
  /** Delete an email account */
  deleteAccount: (accountId: string) => Promise<void>
  /** Refresh account list */
  refresh: () => Promise<void>
}

interface AccountState {
  accounts: EmailAccount[]
  loading: boolean
  error: Error | null
}

/**
 * Initializes accounts hook for email account management
 * @returns Email accounts and management interface
 */
export function useAccounts(): UseAccountsResult {
  const [state, setState] = useState<AccountState>({
    accounts: [],
    loading: true,
    error: null,
  })

  /**
   * Load email accounts from server
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simulate API call to fetch accounts
      await new Promise(resolve => setTimeout(resolve, 500))

      // In production, this would call: GET /api/v1/{tenant}/email_client/accounts
      setState(prev => ({
        ...prev,
        loading: false,
        accounts: prev.accounts.length === 0 ? [] : prev.accounts,
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load accounts')
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }))
    }
  }, [])

  /**
   * Create new email account
   */
  const addAccount = useCallback(
    async (account: Omit<EmailAccount, 'id' | 'unreadCount' | 'totalCount'>): Promise<EmailAccount> => {
      try {
        // Simulate API call to create account
        await new Promise(resolve => setTimeout(resolve, 500))

        // In production, this would call: POST /api/v1/{tenant}/email_client/accounts
        const newAccount: EmailAccount = {
          ...account,
          id: `account_${Date.now()}`,
          unreadCount: 0,
          totalCount: 0,
        }

        setState(prev => ({
          ...prev,
          accounts: [...prev.accounts, newAccount],
        }))

        return newAccount
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add account')
        setState(prev => ({ ...prev, error }))
        throw error
      }
    },
    []
  )

  /**
   * Delete email account
   */
  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      // Simulate API call to delete account
      await new Promise(resolve => setTimeout(resolve, 500))

      // In production, this would call: DELETE /api/v1/{tenant}/email_client/accounts/{accountId}
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== accountId),
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete account')
      setState(prev => ({ ...prev, error }))
      throw error
    }
  }, [])

  /**
   * Load accounts on mount
   */
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    accounts: state.accounts,
    loading: state.loading,
    error: state.error,
    addAccount,
    deleteAccount,
    refresh,
  }
}
