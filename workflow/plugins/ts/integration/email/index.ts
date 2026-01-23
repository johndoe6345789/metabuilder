/**
 * Email Plugin Exports
 * Aggregates all email operation plugins for workflow execution
 */

export { imapSyncExecutor, IMAPSyncExecutor, type IMAPSyncConfig, type SyncData } from './imap-sync/src/index';
export { imapSearchExecutor, IMAPSearchExecutor, type IMAPSearchConfig, type SearchResult } from './imap-search/src/index';
