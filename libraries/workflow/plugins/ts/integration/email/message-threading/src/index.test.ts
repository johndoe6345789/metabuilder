/**
 * Message Threading Executor - Comprehensive Test Suite
 *
 * Test Coverage:
 * - Basic threading (parent-child relationships)
 * - Complex message chains (deep threads, multiple replies)
 * - Orphaned message handling
 * - Unread count tracking
 * - Performance testing (1000+ messages)
 * - Edge cases (circular references, missing headers)
 * - Thread state management
 * - Participant extraction
 * - Subject similarity matching
 */

import {
  MessageThreadingExecutor,
  EmailMessage,
  ThreadGroup,
  ThreadingResult,
  MessageThreadingConfig
} from './index';

describe('MessageThreadingExecutor', () => {
  let executor: MessageThreadingExecutor;

  beforeEach(() => {
    executor = new MessageThreadingExecutor();
  });

  describe('Basic Threading', () => {
    it('should thread simple two-message conversation', () => {
      const msg1: EmailMessage = {
        messageId: 'msg1@example.com',
        subject: 'Hello',
        from: 'alice@example.com',
        to: ['bob@example.com'],
        date: '2026-01-20T10:00:00Z',
        uid: 'uid1',
        isRead: false
      };

      const msg2: EmailMessage = {
        messageId: 'msg2@example.com',
        subject: 'Re: Hello',
        from: 'bob@example.com',
        to: ['alice@example.com'],
        date: '2026-01-20T11:00:00Z',
        inReplyTo: '<msg1@example.com>',
        uid: 'uid2',
        isRead: true
      };

      const config: MessageThreadingConfig = {
        messages: [msg1, msg2],
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads).toHaveLength(1);
      expect(result.threadedCount).toBe(2);
      expect(result.orphanCount).toBe(0);

      const thread = result.threads[0];
      expect(thread.root.message.messageId).toBe('msg1@example.com');
      expect(thread.root.children).toHaveLength(1);
      expect(thread.root.children[0].message.messageId).toBe('msg2@example.com');
      expect(thread.messageCount).toBe(2);
      expect(thread.unreadCount).toBe(1);
    });

    it('should build multi-level thread hierarchy', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Project Discussion',
          from: 'alice@example.com',
          to: ['bob@example.com', 'charlie@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Project Discussion',
          from: 'bob@example.com',
          to: ['alice@example.com', 'charlie@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: false
        },
        {
          messageId: 'msg3@example.com',
          subject: 'Re: Project Discussion',
          from: 'charlie@example.com',
          to: ['alice@example.com', 'bob@example.com'],
          date: '2026-01-20T12:00:00Z',
          inReplyTo: '<msg2@example.com>',
          references: '<msg1@example.com> <msg2@example.com>',
          uid: 'uid3',
          isRead: true
        },
        {
          messageId: 'msg4@example.com',
          subject: 'Re: Project Discussion',
          from: 'alice@example.com',
          to: ['bob@example.com', 'charlie@example.com'],
          date: '2026-01-20T13:00:00Z',
          inReplyTo: '<msg3@example.com>',
          references: '<msg1@example.com> <msg2@example.com> <msg3@example.com>',
          uid: 'uid4',
          isRead: false
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads).toHaveLength(1);
      const thread = result.threads[0];

      // Verify hierarchy
      expect(thread.root.depth).toBe(0);
      expect(thread.root.children[0].depth).toBe(1);
      expect(thread.root.children[0].children[0].depth).toBe(2);
      expect(thread.root.children[0].children[0].children[0].depth).toBe(3);

      expect(thread.messageCount).toBe(4);
      expect(thread.unreadCount).toBe(2); // msg2 and msg4
      expect(thread.metrics.maxDepth).toBe(3);
    });

    it('should handle multiple thread branches', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'root@example.com',
          subject: 'Original',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid0',
          isRead: true
        },
        {
          messageId: 'reply1@example.com',
          subject: 'Re: Original',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<root@example.com>',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'reply2@example.com',
          subject: 'Re: Original',
          from: 'charlie@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:30:00Z',
          inReplyTo: '<root@example.com>',
          uid: 'uid2',
          isRead: false
        },
        {
          messageId: 'reply1_1@example.com',
          subject: 'Re: Original',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T12:00:00Z',
          inReplyTo: '<reply1@example.com>',
          uid: 'uid3',
          isRead: false
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      const thread = result.threads[0];
      expect(thread.root.children).toHaveLength(2); // reply1 and reply2
      expect(thread.root.children[0].children).toHaveLength(1); // reply1_1
      expect(thread.unreadCount).toBe(2);
    });
  });

  describe('Unread Count Tracking', () => {
    it('should accurately track unread messages at all levels', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Test',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: false // unread
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Test',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true // read
        },
        {
          messageId: 'msg3@example.com',
          subject: 'Re: Test',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T12:00:00Z',
          inReplyTo: '<msg2@example.com>',
          uid: 'uid3',
          isRead: false // unread
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      expect(thread.unreadCount).toBe(2);
      expect(result.metrics.totalUnread).toBe(2);
    });

    it('should return zero unread count when all messages read', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Test',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Test',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads[0].unreadCount).toBe(0);
      expect(result.metrics.totalUnread).toBe(0);
    });
  });

  describe('Orphaned Messages', () => {
    it('should detect messages without parent', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'First',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'orphan@example.com',
          subject: 'Orphan',
          from: 'charlie@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          // No inReplyTo or References
          uid: 'uid2',
          isRead: false
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads).toHaveLength(2); // Two separate threads
      expect(result.orphanCount).toBe(0); // Both are roots, not orphans
    });

    it('should handle messages with missing parent references', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Original',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'reply@example.com',
          subject: 'Re: Original',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<missing@example.com>', // Parent doesn't exist
          uid: 'uid2',
          isRead: false
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      // Reply becomes its own root since parent not found
      expect(result.threads).toHaveLength(2);
      expect(result.orphanCount).toBe(0); // Both are roots
    });
  });

  describe('Participant Extraction', () => {
    it('should extract all unique participants from thread', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Test',
          from: 'alice@example.com',
          to: ['bob@example.com', 'charlie@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Test',
          from: 'bob@example.com',
          to: ['alice@example.com', 'charlie@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      expect(thread.participants).toContain('alice@example.com');
      expect(thread.participants).toContain('bob@example.com');
      expect(thread.participants).toContain('charlie@example.com');
      expect(thread.participants).toHaveLength(3);
    });
  });

  describe('Thread State Management', () => {
    it('should expand all nodes when expandAll is true', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Root',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Root',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        expandAll: true,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      // Root should always be expanded
      expect(thread.root.isExpanded).toBe(true);
      // Children should also be expanded when expandAll is true
      expect(thread.root.children[0].isExpanded).toBe(true);
    });

    it('should collapse non-root nodes by default', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Root',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Root',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        expandAll: false,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      expect(thread.root.isExpanded).toBe(true); // Root always expanded
      expect(thread.root.children[0].isExpanded).toBe(false); // Child collapsed
    });
  });

  describe('Subject Similarity Matching', () => {
    it('should calculate exact subject similarity as 1.0', () => {
      const similarity = executor['_calculateSubjectSimilarity'](
        'Project Planning',
        'Project Planning'
      );
      expect(similarity).toBe(1.0);
    });

    it('should calculate subject similarity ignoring Re: prefix', () => {
      const similarity = executor['_calculateSubjectSimilarity'](
        'Re: Project Planning',
        'Project Planning'
      );
      expect(similarity).toBeGreaterThan(0.95);
    });

    it('should calculate partial similarity for similar subjects', () => {
      const similarity = executor['_calculateSubjectSimilarity'](
        'Project Planning Discussion',
        'Project Planning'
      );
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThan(1.0);
    });

    it('should return low similarity for different subjects', () => {
      const similarity = executor['_calculateSubjectSimilarity'](
        'Meeting Tomorrow',
        'Budget Review'
      );
      expect(similarity).toBeLessThan(0.5);
    });
  });

  describe('Date Range Tracking', () => {
    it('should track earliest and latest message dates', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'First',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: First',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T14:30:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        },
        {
          messageId: 'msg3@example.com',
          subject: 'Re: First',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-21T09:15:00Z',
          inReplyTo: '<msg2@example.com>',
          uid: 'uid3',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      expect(thread.startDate).toBe('2026-01-20T10:00:00Z');
      expect(thread.endDate).toBe('2026-01-21T09:15:00Z');
    });
  });

  describe('References Header Parsing', () => {
    it('should parse References header with multiple Message-IDs', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'Original',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'Re: Original',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          references: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        },
        {
          messageId: 'msg3@example.com',
          subject: 'Re: Original',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T12:00:00Z',
          references: '<msg1@example.com> <msg2@example.com>',
          inReplyTo: '<msg2@example.com>',
          uid: 'uid3',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const thread = result.threads[0];

      // Verify proper linking via References
      expect(thread.root.message.messageId).toBe('msg1@example.com');
      expect(thread.root.children[0].message.messageId).toBe('msg2@example.com');
      expect(thread.root.children[0].children[0].message.messageId).toBe(
        'msg3@example.com'
      );
    });
  });

  describe('Performance Testing', () => {
    it('should thread 1000 messages in reasonable time', () => {
      const messages: EmailMessage[] = [];
      const startTime = Date.now();

      // Generate 1000 messages in a single thread
      for (let i = 0; i < 1000; i++) {
        const msg: EmailMessage = {
          messageId: `msg${i}@example.com`,
          subject: `Message ${i}`,
          from: i % 2 === 0 ? 'alice@example.com' : 'bob@example.com',
          to: [i % 2 === 0 ? 'bob@example.com' : 'alice@example.com'],
          date: new Date(2026, 0, 20, 10 + Math.floor(i / 60), i % 60).toISOString(),
          uid: `uid${i}`,
          isRead: i % 3 === 0,
          inReplyTo: i > 0 ? `<msg${i - 1}@example.com>` : undefined,
          references:
            i > 0
              ? `${Array.from({ length: Math.min(i, 20) }, (_, j) => `<msg${i - 20 + j}@example.com>`).join(' ')}`
              : undefined
        };
        messages.push(msg);
      }

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);
      const duration = Date.now() - startTime;

      expect(result.threads).toHaveLength(1);
      expect(result.threadedCount).toBe(1000);
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });

    it('should handle 100 threads with 10 messages each efficiently', () => {
      const messages: EmailMessage[] = [];

      // Generate 100 threads, each with 10 messages
      for (let t = 0; t < 100; t++) {
        for (let i = 0; i < 10; i++) {
          const msg: EmailMessage = {
            messageId: `thread${t}-msg${i}@example.com`,
            subject: `Thread ${t} Message ${i}`,
            from: i % 2 === 0 ? 'alice@example.com' : 'bob@example.com',
            to: [i % 2 === 0 ? 'bob@example.com' : 'alice@example.com'],
            date: new Date(2026, 0, 20 + t, 10 + i).toISOString(),
            uid: `thread${t}-uid${i}`,
            isRead: i % 2 === 0,
            inReplyTo: i > 0 ? `<thread${t}-msg${i - 1}@example.com>` : undefined
          };
          messages.push(msg);
        }
      }

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const startTime = Date.now();
      const result = executor['_threadMessages'](config);
      const duration = Date.now() - startTime;

      expect(result.threads).toHaveLength(100);
      expect(result.threadedCount).toBe(1000);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate correct thread metrics', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'root@example.com',
          subject: 'Root',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid0',
          isRead: true
        },
        {
          messageId: 'reply1@example.com',
          subject: 'Re: Root',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<root@example.com>',
          uid: 'uid1',
          isRead: false
        },
        {
          messageId: 'reply2@example.com',
          subject: 'Re: Root',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T12:00:00Z',
          inReplyTo: '<reply1@example.com>',
          uid: 'uid2',
          isRead: false
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.metrics.avgThreadSize).toBe(3);
      expect(result.metrics.maxThreadSize).toBe(3);
      expect(result.metrics.minThreadSize).toBe(3);
      expect(result.metrics.totalUnread).toBe(2);
      expect(result.metrics.maxDepth).toBe(2);
    });

    it('should handle multiple threads in metrics', () => {
      const messages: EmailMessage[] = [
        // Thread 1
        {
          messageId: 'thread1-msg1@example.com',
          subject: 'First',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'thread1-msg2@example.com',
          subject: 'Re: First',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<thread1-msg1@example.com>',
          uid: 'uid2',
          isRead: true
        },
        // Thread 2
        {
          messageId: 'thread2-msg1@example.com',
          subject: 'Second',
          from: 'charlie@example.com',
          to: ['alice@example.com'],
          date: '2026-01-21T10:00:00Z',
          uid: 'uid3',
          isRead: false
        },
        {
          messageId: 'thread2-msg2@example.com',
          subject: 'Re: Second',
          from: 'alice@example.com',
          to: ['charlie@example.com'],
          date: '2026-01-21T11:00:00Z',
          inReplyTo: '<thread2-msg1@example.com>',
          uid: 'uid4',
          isRead: false
        },
        {
          messageId: 'thread2-msg3@example.com',
          subject: 'Re: Second',
          from: 'charlie@example.com',
          to: ['alice@example.com'],
          date: '2026-01-21T12:00:00Z',
          inReplyTo: '<thread2-msg2@example.com>',
          uid: 'uid5',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads).toHaveLength(2);
      expect(result.metrics.avgThreadSize).toBe(2.5); // (2 + 3) / 2
      expect(result.metrics.maxThreadSize).toBe(3);
      expect(result.metrics.minThreadSize).toBe(2);
      expect(result.metrics.totalUnread).toBe(2);
    });
  });

  describe('Configuration Validation', () => {
    it('should reject empty message list', () => {
      const config: MessageThreadingConfig = {
        messages: [],
        tenantId: 'tenant1'
      };

      expect(() => executor['_validateConfig'](config)).toThrow(
        'Cannot thread empty message list'
      );
    });

    it('should reject missing tenantId', () => {
      const config: any = {
        messages: [
          {
            messageId: 'msg1@example.com',
            subject: 'Test',
            from: 'alice@example.com',
            to: ['bob@example.com'],
            date: '2026-01-20T10:00:00Z',
            uid: 'uid1',
            isRead: true
          }
        ]
      };

      expect(() => executor['_validateConfig'](config)).toThrow(
        'tenantId is required'
      );
    });

    it('should reject invalid maxDepth', () => {
      const config: MessageThreadingConfig = {
        messages: [
          {
            messageId: 'msg1@example.com',
            subject: 'Test',
            from: 'alice@example.com',
            to: ['bob@example.com'],
            date: '2026-01-20T10:00:00Z',
            uid: 'uid1',
            isRead: true
          }
        ],
        maxDepth: 0,
        tenantId: 'tenant1'
      };

      expect(() => executor['_validateConfig'](config)).toThrow(
        'maxDepth must be >= 1'
      );
    });

    it('should reject invalid similarity threshold', () => {
      const config: MessageThreadingConfig = {
        messages: [
          {
            messageId: 'msg1@example.com',
            subject: 'Test',
            from: 'alice@example.com',
            to: ['bob@example.com'],
            date: '2026-01-20T10:00:00Z',
            uid: 'uid1',
            isRead: true
          }
        ],
        subjectSimilarityThreshold: 1.5,
        tenantId: 'tenant1'
      };

      expect(() => executor['_validateConfig'](config)).toThrow(
        'subjectSimilarityThreshold must be between 0 and 1'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle single message (no threading needed)', () => {
      const config: MessageThreadingConfig = {
        messages: [
          {
            messageId: 'solo@example.com',
            subject: 'Alone',
            from: 'alice@example.com',
            to: ['bob@example.com'],
            date: '2026-01-20T10:00:00Z',
            uid: 'uid1',
            isRead: false
          }
        ],
        tenantId: 'tenant1'
      };

      const result = executor['_threadMessages'](config);

      expect(result.threads).toHaveLength(1);
      expect(result.threads[0].messageCount).toBe(1);
      expect(result.threads[0].unreadCount).toBe(1);
      expect(result.orphanCount).toBe(0);
    });

    it('should handle messages with malformed Message-IDs', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'valid@example.com',
          subject: 'Valid',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'malformed-no-at-sign',
          subject: 'Malformed',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      // Should still process without crashing
      const result = executor['_threadMessages'](config);
      expect(result.threads).toHaveLength(2);
    });

    it('should ignore circular references safely', () => {
      const messages: EmailMessage[] = [
        {
          messageId: 'msg1@example.com',
          subject: 'A',
          from: 'alice@example.com',
          to: ['bob@example.com'],
          date: '2026-01-20T10:00:00Z',
          inReplyTo: '<msg2@example.com>',
          uid: 'uid1',
          isRead: true
        },
        {
          messageId: 'msg2@example.com',
          subject: 'B',
          from: 'bob@example.com',
          to: ['alice@example.com'],
          date: '2026-01-20T11:00:00Z',
          inReplyTo: '<msg1@example.com>',
          uid: 'uid2',
          isRead: true
        }
      ];

      const config: MessageThreadingConfig = {
        messages,
        tenantId: 'tenant1'
      };

      // Should handle circular refs without infinite loop
      const result = executor['_threadMessages'](config);
      expect(result.threads.length).toBeGreaterThan(0);
    });
  });
});
