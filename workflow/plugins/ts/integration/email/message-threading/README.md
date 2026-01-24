# Message Threading Node Executor - Phase 6

Professional email message threading plugin for MetaBuilder workflow engine. Groups messages by conversation thread using RFC 5256 IMAP THREAD semantics with advanced features for handling complex email hierarchies.

## Overview

The Message Threading Executor constructs hierarchical conversation threads from raw email messages by analyzing RFC 5322 headers (Message-ID, References, In-Reply-To). Supports handling of orphaned messages, unread tracking per thread, and high-performance processing of 1000+ message conversations.

## Features

### Core Threading

- **RFC 5322 Compliance**: Proper parsing of Message-ID, References, and In-Reply-To headers
- **Hierarchical Trees**: Builds complete parent-child relationships with arbitrary depth
- **Thread Roots**: Automatically identifies conversation roots (original messages)
- **Multiple Threads**: Handles multiple independent conversations in single batch

### Advanced Features

- **Unread Tracking**: Counts unread messages at thread and subtree levels
- **Participant Extraction**: Collects all unique senders/recipients in conversation
- **Date Range**: Tracks earliest and latest message in each thread
- **Thread State**: Manages collapsed/expanded view state per node
- **Performance**: Efficiently threads 1000+ messages in <500ms

### Orphan Handling

- **Orphan Detection**: Identifies messages without parents
- **Orphan Resolution**: Optional linking using date/subject heuristics
- **Orphan Linking Strategies**:
  - `date`: Links orphans to closest message by timestamp
  - `subject`: Fuzzy-matches subjects (with configurable similarity threshold)
  - `none`: Treats orphans as separate conversations

## Installation

```bash
npm install @metabuilder/workflow-plugin-message-threading
```

## Configuration

### Node Parameters

```typescript
interface MessageThreadingConfig {
  // Required
  messages: EmailMessage[];           // Array of email messages to thread
  tenantId: string;                   // Multi-tenant context identifier

  // Optional
  expandAll?: boolean;                // Expand all threads (default: false, only root expanded)
  maxDepth?: number;                  // Maximum tree depth (default: 100)
  resolveOrphans?: boolean;           // Enable orphan resolution (default: false)
  orphanLinkingStrategy?: 'date' | 'subject' | 'none';  // How to link orphans
  subjectSimilarityThreshold?: number; // Threshold 0.0-1.0 for subject matching (default: 0.6)
}
```

### Input Message Format

```typescript
interface EmailMessage {
  messageId: string;                  // RFC 5322 Message-ID (required)
  subject: string;                    // Email subject
  from: string;                       // Sender email
  to: string[];                       // Recipient emails
  date: string;                       // ISO 8601 timestamp
  uid: string;                        // Message UID for retrieval
  isRead: boolean;                    // Read status

  // Optional RFC 5322 headers
  references?: string;                // Space-separated Message-IDs from RFC 5322
  inReplyTo?: string;                 // Parent Message-ID from In-Reply-To header
  flags?: string[];                   // User labels/keywords
  size?: number;                      // Message size in bytes
}
```

## Output Format

### ThreadingResult

```typescript
interface ThreadingResult {
  threads: ThreadGroup[];             // Array of conversation threads
  messageCount: number;               // Total input messages
  threadedCount: number;              // Messages successfully threaded
  orphanCount: number;                // Messages without parents
  executionDuration: number;          // Processing time (ms)
  warnings: string[];                 // Non-fatal issues
  errors: ThreadingError[];           // Critical errors
  metrics: {
    avgThreadSize: number;            // Average messages per thread
    maxThreadSize: number;            // Largest thread size
    minThreadSize: number;            // Smallest thread size
    totalUnread: number;              // Total unread across all threads
    maxDepth: number;                 // Deepest nesting level
  };
}
```

### ThreadGroup

```typescript
interface ThreadGroup {
  threadId: string;                   // Root message ID
  root: ThreadNode;                   // Root message node with tree structure
  messages: EmailMessage[];           // Flat array of all messages
  unreadCount: number;                // Total unread in thread
  participants: string[];             // All unique email addresses
  startDate: string;                  // Earliest message (ISO 8601)
  endDate: string;                    // Latest message (ISO 8601)
  messageCount: number;               // Total messages in thread
  orphanedMessages: EmailMessage[];   // Messages without parents
  threadState: {
    expandedNodeIds: Set<string>;     // Message IDs in expanded state
    collapsedNodeIds: Set<string>;    // Message IDs in collapsed state
  };
  metrics: {
    threadingDurationMs: number;      // Time to build this thread
    orphanCount: number;              // Orphans in this thread
    maxDepth: number;                 // Tree depth
    avgMessagesPerLevel: number;      // Avg messages per nesting level
  };
}
```

### ThreadNode

```typescript
interface ThreadNode {
  message: EmailMessage;              // The email message
  children: ThreadNode[];             // Direct replies
  parentId: string | null;            // Parent message ID
  depth: number;                      // 0 = root
  isExpanded: boolean;                // UI collapse/expand state
  unreadCount: number;                // Unread in this subtree
  participants: Set<string>;          // Senders/recipients in subtree
}
```

## Usage Examples

### Basic Threading

```typescript
import { messageThreadingExecutor } from '@metabuilder/workflow-plugin-message-threading';

const executor = messageThreadingExecutor();

const config: MessageThreadingConfig = {
  messages: [
    {
      messageId: 'msg1@company.com',
      subject: 'Project Update',
      from: 'alice@company.com',
      to: ['bob@company.com'],
      date: '2026-01-20T10:00:00Z',
      uid: 'uid-001',
      isRead: true
    },
    {
      messageId: 'msg2@company.com',
      subject: 'Re: Project Update',
      from: 'bob@company.com',
      to: ['alice@company.com'],
      date: '2026-01-20T11:00:00Z',
      inReplyTo: '<msg1@company.com>',
      uid: 'uid-002',
      isRead: false
    }
  ],
  tenantId: 'company-123'
};

const result = executor.execute({
  node: { id: 'thread-001', name: 'Thread Messages', nodeType: 'message-threading', parameters: config },
  context: {
    executionId: 'exec-001',
    tenantId: 'company-123',
    userId: 'user-001',
    triggerData: {},
    variables: {}
  },
  state: {}
});

console.log(result.output);
// Result includes:
// - result.threads: Array of ThreadGroup objects
// - result.statistics: Thread counts and metrics
// - result.metrics: Detailed performance metrics
```

### Handling Orphans with Subject Matching

```typescript
const config: MessageThreadingConfig = {
  messages: [/* ... */],
  tenantId: 'company-123',
  resolveOrphans: true,
  orphanLinkingStrategy: 'subject',
  subjectSimilarityThreshold: 0.75  // 75% subject similarity required
};

const result = executor.execute({
  node: { /* ... */, parameters: config },
  context: { /* ... */ },
  state: {}
});

// Orphans will be linked to similar conversations
// Check result.output.threads[n].orphanedMessages for unresolved orphans
```

### High-Performance Threading (1000+ messages)

```typescript
const largeMessageSet: EmailMessage[] = generateLargeEmailSet(5000);

const config: MessageThreadingConfig = {
  messages: largeMessageSet,
  tenantId: 'company-123',
  maxDepth: 50,           // Limit tree depth
  expandAll: false        // Don't expand all (UI optimization)
};

const startTime = Date.now();
const result = executor.execute({
  node: { /* ... */, parameters: config },
  context: { /* ... */ },
  state: {}
});
const duration = Date.now() - startTime;

console.log(`Threaded ${result.output.statistics.totalMessages} messages in ${duration}ms`);
console.log(`Created ${result.output.statistics.threadCount} threads`);
console.log(`Max thread depth: ${result.output.statistics.maxDepth}`);
```

## Algorithm Details

### Threading Algorithm (RFC 5256)

1. **Message Indexing**: Build map of messageId → message for O(1) lookup
2. **Parent Extraction**: Parse In-Reply-To and References headers
   - In-Reply-To takes precedence if present
   - Otherwise use last Message-ID from References
3. **Relationship Building**: Construct parent-child mappings
4. **Root Finding**: Identify messages with no parents
5. **Tree Construction**: Recursively build thread hierarchies
6. **Metrics Calculation**: Count unread, extract participants, find date range
7. **Orphan Resolution** (optional): Link orphaned messages using heuristics

### Subject Similarity (Levenshtein Distance)

```
similarity = (longer.length - editDistance) / longer.length
```

Subject normalization:
- Remove "Re: " prefixes
- Case-insensitive comparison
- Configurable threshold (default: 0.6 = 60% match)

### Performance Characteristics

| Input Size | Typical Duration | Memory |
|-----------|------------------|--------|
| 100 msgs | <10ms | ~1MB |
| 1,000 msgs | <100ms | ~10MB |
| 5,000 msgs | <300ms | ~50MB |
| 10,000 msgs | <600ms | ~100MB |

Tested on Node.js with typical email patterns (avg 3-5 msgs/thread).

## Error Handling

### Recoverable Errors

- Invalid Message-IDs: Treated as separate conversations
- Missing parent references: Message becomes root
- Malformed dates: Uses epoch if unparseable
- Circular references: Breaks cycles (not traversed)

### Non-Recoverable Errors

- Empty message array: Throws error
- Missing tenantId: Throws error
- Invalid configuration values: Throws error

## Use Cases

### Email Client Threading

```typescript
// Display conversation threads in email UI
const threads = result.output.threads;

// Build UI tree from ThreadNode structure
threads.forEach(group => {
  renderThreadUI(group.root, {
    collapsed: !group.root.isExpanded,
    unreadBadge: group.root.unreadCount > 0 ? group.root.unreadCount : null
  });
});
```

### Conversation Analytics

```typescript
// Analyze conversation patterns
const stats = result.output.statistics;
console.log(`Average thread size: ${stats.avgThreadSize}`);
console.log(`Total unread: ${stats.totalUnread}`);
console.log(`Max nesting depth: ${stats.maxDepth}`);

// Per-thread metrics
result.output.threads.forEach(thread => {
  console.log(`Thread "${thread.messages[0].subject}"`);
  console.log(`  Messages: ${thread.messageCount}`);
  console.log(`  Participants: ${thread.participants.length}`);
  console.log(`  Duration: ${new Date(thread.endDate).getTime() - new Date(thread.startDate).getTime()}ms`);
});
```

### Unread Management

```typescript
// Get all unread threads
const unreadThreads = result.output.threads.filter(t => t.unreadCount > 0);

// Get deeply nested unread messages
const findUnreadAtDepth = (node: ThreadNode, depth: number): ThreadNode[] => {
  if (node.depth === depth && !node.message.isRead) {
    return [node];
  }
  return node.children.flatMap(c => findUnreadAtDepth(c, depth));
};
```

## Testing

Comprehensive test suite with 40+ test cases:

```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report
```

### Test Categories

- Basic threading (simple chains)
- Multi-level hierarchies (deep threads)
- Multiple branches (parallel replies)
- Unread tracking (at all levels)
- Orphan handling (detection & resolution)
- Participant extraction (unique addresses)
- Thread state (collapsed/expanded)
- Subject matching (Levenshtein distance)
- Date range tracking (earliest/latest)
- References header parsing (complex chains)
- Performance (1000+ messages)
- Edge cases (circular refs, malformed IDs)
- Configuration validation (all parameters)

Coverage: >80% branches, functions, lines, statements

## Workflow Integration

### Workflow JSON Example

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "fetch-messages",
      "type": "operation",
      "op": "imap-sync",
      "parameters": {
        "imapId": "{{ $json.accountId }}",
        "folderId": "{{ $json.folderId }}"
      }
    },
    {
      "id": "thread-messages",
      "type": "operation",
      "op": "message-threading",
      "parameters": {
        "messages": "{{ $json.messages }}",
        "tenantId": "{{ context.tenantId }}",
        "expandAll": false,
        "resolveOrphans": true,
        "orphanLinkingStrategy": "date"
      },
      "dependsOn": ["fetch-messages"]
    },
    {
      "id": "render-ui",
      "type": "operation",
      "op": "render-component",
      "parameters": {
        "component": "ThreadListView",
        "props": {
          "threads": "{{ $json.threads }}"
        }
      },
      "dependsOn": ["thread-messages"]
    }
  ]
}
```

## References

- RFC 5322: Internet Message Format
- RFC 5256: IMAP4 THREAD Extension (conversation threading algorithm)
- RFC 5322 Obsoletes: RFC 2822, RFC 822

## Compatibility

- **Node.js**: 18+
- **TypeScript**: 5.0+
- **MetaBuilder Workflow**: ^3.0.0

## License

MIT - See LICENSE in repository root
