/**
 * Email Plugin Exports
 * Aggregates all email operation plugins for workflow execution
 */

export { imapSyncExecutor, IMAPSyncExecutor, type IMAPSyncConfig, type SyncData } from './imap-sync/src/index';
export { imapSearchExecutor, IMAPSearchExecutor, type IMAPSearchConfig, type SearchResult } from './imap-search/src/index';
export {
  attachmentHandlerExecutor,
  AttachmentHandlerExecutor,
  type AttachmentHandlerConfig,
  type AttachmentHandlerResult,
  type AttachmentMetadata as AttachmentMetadataRecord,
  MIME_TYPE_PATTERNS,
  DANGEROUS_MIME_TYPES,
  DANGEROUS_EXTENSIONS
} from './attachment-handler/src/index';
export {
  pop3SyncExecutor,
  POP3SyncExecutor,
  type POP3SyncConfig,
  type POP3SyncData,
  type SyncError
} from './pop3-sync/src/index';
export {
  emailParserExecutor,
  EmailParserExecutor,
  type EmailParserConfig,
  type ParsedEmailMessage,
  type EmailAttachmentMetadata,
  type ParserResult,
  type ParserError
} from './email-parser/src/index';
export {
  draftManagerExecutor,
  DraftManagerExecutor,
  type DraftManagerConfig,
  type DraftOperationResult,
  type DraftState,
  type DraftSaveMetadata,
  type DraftRecovery,
  type DraftBundle,
  type EmailRecipient,
  type AttachmentMetadata,
  type DraftAction
} from './draft-manager/src/index';
export {
  messageThreadingExecutor,
  MessageThreadingExecutor,
  type MessageThreadingConfig,
  type ThreadingResult,
  type ThreadingError,
  type EmailMessage,
  type ThreadNode,
  type ThreadGroup
} from './message-threading/src/index';
export {
  spamDetectorExecutor,
  SpamDetectorExecutor,
  type SpamDetectorConfig,
  type SpamDetectionResult,
  type SpamIndicator,
  type SpamClassification,
  type AuthenticationStatus,
  type DnsblResult,
  type SenderReputation
} from './spam-detector/src/index';
export {
  rateLimiterExecutor,
  RateLimiterExecutor,
  type RateLimitConfig,
  type RateLimitResult,
  type TokenBucketState,
  type RateLimitType
} from './rate-limiter/src/index';
export {
  templateManagerExecutor,
  TemplateManagerExecutor,
  type TemplateManagerConfig,
  type TemplateOperationResult,
  type EmailTemplate,
  type ExpandedTemplate,
  type TemplateVariable,
  type TemplateShareConfig,
  type TemplateUsageRecord,
  type TemplateAction
} from './template-manager/src/index';
export {
  calendarSyncExecutor,
  CalendarSyncExecutor,
  type CalendarSyncConfig,
  type CalendarSyncResult,
  type CalendarEvent,
  type EventAttendee,
  type TimeConflict,
  type TimeSlot,
  type CalendarError
} from './calendar-sync/src/index';
