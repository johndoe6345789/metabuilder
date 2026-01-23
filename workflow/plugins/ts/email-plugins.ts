/**
 * Email Operation Plugin Node Definitions
 * Registers email plugins (imap-sync, imap-search, email-parser) with workflow engine
 */

/**
 * IMAP Sync Node Definition
 * Performs incremental synchronization of emails from IMAP server
 *
 * @example
 * {
 *   "id": "sync-inbox",
 *   "type": "node",
 *   "nodeType": "imap-sync",
 *   "name": "Sync Inbox",
 *   "description": "Synchronize new emails from Gmail inbox",
 *   "inputs": [
 *     {
 *       "id": "imapId",
 *       "name": "IMAP Account ID",
 *       "type": "string",
 *       "required": true,
 *       "description": "UUID of email account configuration"
 *     },
 *     {
 *       "id": "folderId",
 *       "name": "Folder ID",
 *       "type": "string",
 *       "required": true,
 *       "description": "UUID of email folder to sync"
 *     },
 *     {
 *       "id": "syncToken",
 *       "name": "Sync Token",
 *       "type": "string",
 *       "required": false,
 *       "description": "IMAP sync token from previous sync (UIDVALIDITY:UIDNEXT)"
 *     },
 *     {
 *       "id": "maxMessages",
 *       "name": "Max Messages",
 *       "type": "number",
 *       "required": false,
 *       "description": "Maximum messages to sync per execution (default: 100)"
 *     }
 *   ],
 *   "outputs": [
 *     {
 *       "id": "status",
 *       "name": "Status",
 *       "type": "string",
 *       "description": "Sync status: 'synced', 'error'"
 *     },
 *     {
 *       "id": "data",
 *       "name": "Sync Data",
 *       "type": "object",
 *       "description": "Contains syncedCount, errors array, newSyncToken, lastSyncAt"
 *     }
 *   ]
 * }
 */
export const IMAPSyncNodeDef = {
  nodeType: 'imap-sync',
  category: 'email-integration',
  label: 'IMAP Sync',
  description: 'Synchronize emails from IMAP server (incremental)',
  inputs: [
    {
      id: 'imapId',
      label: 'IMAP Account ID',
      type: 'string',
      required: true,
      description: 'UUID of email account configuration'
    },
    {
      id: 'folderId',
      label: 'Folder ID',
      type: 'string',
      required: true,
      description: 'UUID of email folder to sync'
    },
    {
      id: 'syncToken',
      label: 'Sync Token',
      type: 'string',
      required: false,
      description: 'IMAP sync token from previous sync (UIDVALIDITY:UIDNEXT)'
    },
    {
      id: 'maxMessages',
      label: 'Max Messages',
      type: 'number',
      required: false,
      default: 100,
      description: 'Maximum messages to sync per execution'
    }
  ],
  outputs: [
    {
      id: 'status',
      label: 'Status',
      type: 'string',
      description: "Sync status: 'synced' or 'error'"
    },
    {
      id: 'data',
      label: 'Sync Data',
      type: 'object',
      description: 'Object containing syncedCount, errors array, newSyncToken, lastSyncAt'
    }
  ]
} as const;

/**
 * IMAP Search Node Definition
 * Executes IMAP SEARCH commands to find messages matching criteria
 *
 * @example
 * {
 *   "id": "find-unread",
 *   "type": "node",
 *   "nodeType": "imap-search",
 *   "name": "Find Unread",
 *   "description": "Search for unread emails",
 *   "inputs": [
 *     {
 *       "id": "imapId",
 *       "name": "IMAP Account ID",
 *       "type": "string",
 *       "required": true
 *     },
 *     {
 *       "id": "folderId",
 *       "name": "Folder ID",
 *       "type": "string",
 *       "required": true
 *     },
 *     {
 *       "id": "criteria",
 *       "name": "Search Criteria",
 *       "type": "string",
 *       "required": true,
 *       "description": "IMAP SEARCH criteria (e.g., 'UNSEEN SINCE 01-Jan-2026')"
 *     },
 *     {
 *       "id": "limit",
 *       "name": "Result Limit",
 *       "type": "number",
 *       "required": false,
 *       "description": "Maximum results to return (default: 100)"
 *     }
 *   ],
 *   "outputs": [
 *     {
 *       "id": "status",
 *       "name": "Status",
 *       "type": "string",
 *       "description": "Search status: 'found', 'error'"
 *     },
 *     {
 *       "id": "data",
 *       "name": "Search Results",
 *       "type": "object",
 *       "description": "Contains messageIds array, totalCount, criteria, executedAt"
 *     }
 *   ]
 * }
 */
export const IMAPSearchNodeDef = {
  nodeType: 'imap-search',
  category: 'email-integration',
  label: 'IMAP Search',
  description: 'Search emails using IMAP SEARCH command',
  inputs: [
    {
      id: 'imapId',
      label: 'IMAP Account ID',
      type: 'string',
      required: true,
      description: 'UUID of email account configuration'
    },
    {
      id: 'folderId',
      label: 'Folder ID',
      type: 'string',
      required: true,
      description: 'UUID of email folder to search'
    },
    {
      id: 'criteria',
      label: 'Search Criteria',
      type: 'string',
      required: true,
      description: 'IMAP SEARCH criteria (e.g., "UNSEEN SINCE 01-Jan-2026 FLAGGED")'
    },
    {
      id: 'limit',
      label: 'Result Limit',
      type: 'number',
      required: false,
      default: 100,
      description: 'Maximum results to return'
    }
  ],
  outputs: [
    {
      id: 'status',
      label: 'Status',
      type: 'string',
      description: "Search status: 'found' or 'error'"
    },
    {
      id: 'data',
      label: 'Search Results',
      type: 'object',
      description: 'Object containing messageIds array, totalCount, criteria, executedAt'
    }
  ]
} as const;

/**
 * Email Parser Node Definition
 * Parses RFC 5322 format email messages
 *
 * @example
 * {
 *   "id": "parse-email",
 *   "type": "node",
 *   "nodeType": "email-parser",
 *   "name": "Parse Email",
 *   "description": "Parse email message from raw RFC 5322 format",
 *   "inputs": [
 *     {
 *       "id": "message",
 *       "name": "Message",
 *       "type": "string",
 *       "required": true,
 *       "description": "Email message in RFC 5322 format"
 *     },
 *     {
 *       "id": "includeAttachments",
 *       "name": "Include Attachments",
 *       "type": "boolean",
 *       "required": false,
 *       "description": "Whether to extract attachment metadata (default: true)"
 *     }
 *   ],
 *   "outputs": [
 *     {
 *       "id": "status",
 *       "name": "Status",
 *       "type": "string",
 *       "description": "Parse status: 'parsed', 'error'"
 *     },
 *     {
 *       "id": "data",
 *       "name": "Parsed Email",
 *       "type": "object",
 *       "description": "Contains headers, body, textBody, htmlBody, attachments, parseTime"
 *     }
 *   ]
 * }
 */
export const EmailParserNodeDef = {
  nodeType: 'email-parser',
  category: 'email-utility',
  label: 'Email Parser',
  description: 'Parse RFC 5322 format email messages',
  inputs: [
    {
      id: 'message',
      label: 'Message',
      type: 'string',
      required: true,
      description: 'Email message in RFC 5322 format'
    },
    {
      id: 'includeAttachments',
      label: 'Include Attachments',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Whether to extract attachment metadata'
    }
  ],
  outputs: [
    {
      id: 'status',
      label: 'Status',
      type: 'string',
      description: "Parse status: 'parsed' or 'error'"
    },
    {
      id: 'data',
      label: 'Parsed Email',
      type: 'object',
      description: 'Object containing headers, body, textBody, htmlBody, attachments, parseTime'
    }
  ]
} as const;

/**
 * Email Plugin Node Registry
 * Central registry of all email operation node definitions
 */
export const EMAIL_PLUGIN_NODES = {
  'imap-sync': IMAPSyncNodeDef,
  'imap-search': IMAPSearchNodeDef,
  'email-parser': EmailParserNodeDef
} as const;

export type EmailNodeType = keyof typeof EMAIL_PLUGIN_NODES;
