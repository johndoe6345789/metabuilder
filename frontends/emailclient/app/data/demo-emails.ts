import type {
  FolderNavigationItem,
} from '@metabuilder/fakemui/email'

export const DEMO_FOLDERS: FolderNavigationItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: 'inbox',
    unreadCount: 3,
    isActive: true,
  },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'sent', label: 'Sent', icon: 'send' },
  {
    id: 'drafts',
    label: 'Drafts',
    icon: 'drafts',
    unreadCount: 1,
  },
  { id: 'spam', label: 'Spam', icon: 'report' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
]

const now = Date.now()
const hour = 3600000
const day = 86400000

export const DEMO_EMAILS = [
  {
    id: '1',
    testId: '1',
    from: 'Alice Chen',
    to: ['you@metabuilder.io'],
    subject: 'Sprint planning for next week',
    preview:
      'Hey team, I\'ve put together the backlog' +
      ' items we need to discuss in our sprint' +
      ' planning session...',
    receivedAt: now - 2 * hour,
    isRead: false,
    isStarred: true,
    body:
      'Hey team,\n\nI\'ve put together the backlog' +
      ' items we need to discuss in our sprint' +
      ' planning session on Monday. Please review' +
      ' the board before the meeting.\n\n' +
      'Key items:\n' +
      '- DBAL multi-adapter support\n' +
      '- Email client backend integration\n' +
      '- Workflow engine performance improvements' +
      '\n\nLet me know if you have anything to add.' +
      '\n\nBest,\nAlice',
  },
  {
    id: '2',
    testId: '2',
    from: 'GitHub',
    to: ['you@metabuilder.io'],
    subject:
      '[metabuilder] PR #847: Fix loadFromDirectory' +
      ' tenantId auto-add',
    preview:
      'mergify[bot] merged pull request #847.' +
      ' loadFromDirectory() was missing the' +
      ' tenantId field...',
    receivedAt: now - 5 * hour,
    isRead: false,
    isStarred: false,
    body:
      'mergify[bot] merged pull request #847.\n\n' +
      'loadFromDirectory() was missing the tenantId' +
      ' field auto-add logic that loadFromFile()' +
      ' already had, causing "Unknown field:' +
      ' tenantId" on all entities using the' +
      ' shorthand convention.\n\n' +
      'Files changed: 2\n' +
      'Additions: 51\nDeletions: 22',
  },
  {
    id: '3',
    testId: '3',
    from: 'Bob Martinez',
    to: ['you@metabuilder.io'],
    cc: ['alice@metabuilder.io'],
    subject: 'Re: Database adapter benchmarks',
    preview:
      'The PostgreSQL adapter is showing 3x' +
      ' throughput improvement with the new' +
      ' connection pool settings...',
    receivedAt: now - 1 * day,
    isRead: false,
    isStarred: false,
    body:
      'The PostgreSQL adapter is showing 3x' +
      ' throughput improvement with the new' +
      ' connection pool settings. Here are the' +
      ' results:\n\n' +
      '- SQLite: 12,400 ops/sec (dev baseline)\n' +
      '- PostgreSQL: 8,900 ops/sec -> 26,700' +
      ' ops/sec\n' +
      '- MySQL: 7,200 ops/sec (unchanged)\n\n' +
      'I\'ll push the config changes to the' +
      ' deployment branch.\n\nBob',
  },
  {
    id: '4',
    testId: '4',
    from: 'Docker Hub',
    to: ['you@metabuilder.io'],
    subject: 'Build succeeded: metabuilder/dbal:latest',
    preview:
      'Your automated build for metabuilder/dbal' +
      ' has completed successfully. Image size:' +
      ' 487MB...',
    receivedAt: now - 1 * day - 3 * hour,
    isRead: true,
    isStarred: false,
    body:
      'Your automated build for metabuilder/dbal' +
      ' has completed successfully.\n\n' +
      'Image: metabuilder/dbal:latest\n' +
      'Size: 487MB\nBuild time: 4m 23s\n' +
      'Layers: 12',
  },
  {
    id: '5',
    testId: '5',
    from: 'Carol Wu',
    to: ['you@metabuilder.io'],
    subject: 'FakeMUI component audit results',
    preview:
      'Finished the component audit - 167' +
      ' components across 11 categories. All' +
      ' tests passing...',
    receivedAt: now - 2 * day,
    isRead: true,
    isStarred: true,
    body:
      'Finished the component audit - 167' +
      ' components across 11 categories. All' +
      ' tests passing.\n\n' +
      'Breakdown:\n' +
      '- Core React: 145 components\n' +
      '- Email: 22 components\n' +
      '- Icons: 421\n' +
      '- SCSS modules: 78\n\n' +
      'The QML ports are at 104 components.' +
      ' Python bindings cover 15 of the most-used' +
      ' ones.\n\nCarol',
  },
  {
    id: '6',
    testId: '6',
    from: 'Sentry',
    to: ['you@metabuilder.io'],
    subject:
      'New issue: DBAL fetch failed: 422' +
      ' Unprocessable Entity',
    preview:
      'A new error was detected in' +
      ' codegen-frontend. fetchFromDBAL threw an' +
      ' error for unknown entity...',
    receivedAt: now - 3 * day,
    isRead: true,
    isStarred: false,
    body:
      'A new error was detected in' +
      ' codegen-frontend.\n\n' +
      'Error: DBAL fetch failed: 422' +
      ' Unprocessable Entity\n' +
      'File: src/store/middleware/dbalSync.ts:131\n' +
      'Occurrences: 47\nUsers affected: 3\n\n' +
      'Stack trace:\n' +
      'fetchFromDBAL @ dbalSync.ts:131\n' +
      'loadSettings @ layout.tsx:33',
  },
]
