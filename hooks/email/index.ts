/**
 * Email custom hooks for React
 * Provides hooks for email synchronization, storage, accounts, and message management
 * @packageDocumentation
 */

export { useEmailSync, type UseEmailSyncResult } from './useEmailSync'
export { useEmailStore, type UseEmailStoreResult, type StoredMessage } from './useEmailStore'
export { useMailboxes, type UseMailboxesResult, type Folder } from './useMailboxes'
export { useAccounts, type UseAccountsResult, type EmailAccount } from './useAccounts'
export { useCompose, type UseComposeResult, type EmailDraft } from './useCompose'
export { useMessages, type UseMessagesResult, type Message } from './useMessages'
