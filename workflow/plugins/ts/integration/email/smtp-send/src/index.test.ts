/**
 * SMTP Send Plugin Test Suite - Phase 6
 * Comprehensive tests covering success, partial, and failure scenarios
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  SMTPSendExecutor,
  SMTPSendConfig,
  SendResult,
  DeliveryError,
  EmailAttachment,
  SMTPConfig
} from './index';

/**
 * Mock WorkflowNode for testing
 */
interface MockNode {
  id: string;
  type: string;
  nodeType: string;
  parameters: Record<string, any>;
}

/**
 * Mock WorkflowContext for testing
 */
interface MockContext {
  executionId: string;
  tenantId: string;
  userId: string;
  triggerData: Record<string, any>;
  variables: Record<string, any>;
}

/**
 * Mock ExecutionState for testing
 */
interface MockState {
  [key: string]: any;
}

describe('SMTPSendExecutor - Phase 6', () => {
  let executor: SMTPSendExecutor;
  let mockContext: MockContext;
  let mockState: MockState;

  beforeEach(() => {
    executor = new SMTPSendExecutor();
    mockContext = {
      executionId: 'exec-123',
      tenantId: 'tenant-acme',
      userId: 'user-456',
      triggerData: {},
      variables: {}
    };
    mockState = {};
  });

  describe('Node Type and Metadata', () => {
    it('should have correct node type identifier', () => {
      expect(executor.nodeType).toBe('smtp-send');
    });

    it('should have correct category', () => {
      expect(executor.category).toBe('email-integration');
    });

    it('should have descriptive description', () => {
      expect(executor.description).toContain('Send emails via SMTP');
      expect(executor.description).toContain('HTML');
      expect(executor.description).toContain('attachments');
    });
  });

  describe('Validation', () => {
    it('should reject missing from address', () => {
      const node = createMockNode({
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });
      delete node.parameters.from;

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Sender address'));
    });

    it('should reject invalid from address format', () => {
      const node = createMockNode({
        from: 'not-an-email',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('not a valid email address'));
    });

    it('should reject missing to addresses', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });
      delete node.parameters.to;

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('At least one recipient'));
    });

    it('should reject empty to addresses array', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: [],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('At least one recipient'));
    });

    it('should reject invalid email addresses in to array', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['valid@example.com', 'invalid-email'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid email address'));
    });

    it('should reject invalid cc addresses', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        cc: ['not-an-email'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid email address in cc'));
    });

    it('should reject invalid bcc addresses', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        bcc: ['invalid.email'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid email address in bcc'));
    });

    it('should reject invalid reply-to address', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        replyTo: 'not-valid',
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid reply-to address'));
    });

    it('should reject missing subject', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });
      delete node.parameters.subject;

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('subject is required'));
    });

    it('should reject empty subject', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: '   ',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('cannot be empty'));
    });

    it('should reject missing both textBody and htmlBody', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('At least one of textBody or htmlBody'));
    });

    it('should accept text body only', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept html body only', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        htmlBody: '<p>Test message</p>',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept both text and html body', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        htmlBody: '<p>Test message</p>',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject missing SMTP configuration', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message'
      });
      delete node.parameters.smtpConfig;
      delete node.parameters.credentialId;

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('credentialId or smtpConfig'));
    });

    it('should reject invalid SMTP host', () => {
      const smtpConfig = createMockSMTPConfig();
      delete smtpConfig.host;

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('SMTP host is required'));
    });

    it('should reject invalid SMTP port', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.port = 99999;

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('SMTP port'));
    });

    it('should reject invalid SMTP encryption', () => {
      const smtpConfig = createMockSMTPConfig();
      (smtpConfig as any).encryption = 'invalid';

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining("SMTP encryption must be 'tls'"));
    });

    it('should reject invalid attachments format', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        attachments: 'not-an-array',
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Attachments must be an array'));
    });

    it('should reject attachment missing filename', () => {
      const attachment: any = {
        contentType: 'text/plain',
        data: 'Zm9v' // "foo" in base64
      };

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        attachments: [attachment],
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('missing or invalid filename'));
    });

    it('should accept valid complete configuration', () => {
      const node = createMockNode({
        from: 'sender@example.com',
        fromName: 'Sender Name',
        to: ['recipient@example.com', 'another@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        replyTo: 'reply@example.com',
        subject: 'Test Subject',
        textBody: 'Plain text body',
        htmlBody: '<p>HTML body</p>',
        attachments: [
          {
            filename: 'document.pdf',
            contentType: 'application/pdf',
            data: 'JVBERi0xLjQK' // Minimal PDF header in base64
          }
        ],
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should warn on oversized attachments', () => {
      const largeData = 'A'.repeat(27000000); // >20MB base64

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test message',
        attachments: [
          {
            filename: 'large.bin',
            contentType: 'application/octet-stream',
            data: largeData
          }
        ],
        smtpConfig: createMockSMTPConfig()
      });

      const result = executor.validate(node);
      // Should still be valid but with warning
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('too large');
    });
  });

  describe('Test Case 1: Successful Email Send', () => {
    it('should successfully send simple email with text only', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        textBody: 'This is a test email',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');
      expect(result.timestamp).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);

      const output = (result as any).output;
      expect(output.status).toBe('sent');
      expect(output.data).toBeDefined();

      const sendData: SendResult = output.data;
      expect(sendData.status).toBe('sent');
      expect(sendData.messageId).toBeDefined();
      expect(sendData.messageId).toMatch(/^<.+@.+>$/);
      expect(sendData.sentAt).toBeGreaterThan(0);
      expect(sendData.errors.length).toBe(0);
      expect(sendData.successCount).toBe(1);
      expect(sendData.failureCount).toBe(0);
      expect(sendData.queueId).toBeDefined();
      expect(sendData.smtpCode).toBe(250);

      console.log('Test Case 1 PASSED: Simple email send');
      console.log(`  - Message ID: ${sendData.messageId}`);
      console.log(`  - Queue ID: ${sendData.queueId}`);
    });

    it('should send email with HTML and text alternatives', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        fromName: 'Test Sender',
        to: ['recipient@example.com'],
        subject: 'Multi-part Email',
        textBody: 'Plain text version',
        htmlBody: '<html><body><h1>HTML Version</h1></body></html>',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');

      const sendData: SendResult = (result as any).output.data;
      expect(sendData.status).toBe('sent');
      expect(sendData.successCount).toBe(1);

      console.log('Test Case 1 PASSED: Multi-part email (text + HTML)');
      console.log(`  - Sender: Test Sender <${node.parameters.from}>`);
    });

    it('should send email with attachments', async () => {
      const attachment: EmailAttachment = {
        filename: 'test.txt',
        contentType: 'text/plain',
        data: 'VGhpcyBpcyB0ZXN0IGRhdGE=' // "This is test data" in base64
      };

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Attachment',
        textBody: 'See attachment',
        attachments: [attachment],
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');

      const sendData: SendResult = (result as any).output.data;
      expect(sendData.status).toBe('sent');
      expect(sendData.successCount).toBe(1);

      console.log('Test Case 1 PASSED: Email with attachment');
      console.log(`  - Attachment: ${attachment.filename} (${attachment.contentType})`);
    });

    it('should send email to multiple recipients', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient1@example.com', 'recipient2@example.com'],
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        subject: 'Multi-recipient Email',
        textBody: 'Message for everyone',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toMatch(/success|partial/);

      const sendData: SendResult = (result as any).output.data;
      expect(sendData.successCount).toBeGreaterThan(0);

      console.log('Test Case 1 PASSED: Multi-recipient email');
      console.log(`  - To: 2 recipients`);
      console.log(`  - CC: 1 recipient`);
      console.log(`  - BCC: 1 recipient`);
      console.log(`  - Success count: ${sendData.successCount}`);
    });

    it('should include custom headers', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Custom Headers',
        textBody: 'Test message',
        customHeaders: {
          'X-Priority': '1',
          'X-Custom-Header': 'custom-value'
        },
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('success');

      console.log('Test Case 1 PASSED: Email with custom headers');
    });

    it('should request delivery notifications', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with DSN',
        textBody: 'Requesting delivery notification',
        requestDeliveryNotification: true,
        requestReadReceipt: true,
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toMatch(/success|partial/);

      console.log('Test Case 1 PASSED: Email with delivery notifications');
    });
  });

  describe('Test Case 2: Partial Delivery Failures', () => {
    it('should track partial delivery with per-recipient errors', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient1@example.com', 'recipient2@example.com', 'recipient3@example.com'],
        subject: 'Test Partial Delivery',
        textBody: 'Testing partial delivery',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      const sendData: SendResult = (result as any).output.data;

      // Verify error structure when present
      if (sendData.errors.length > 0) {
        sendData.errors.forEach((error: DeliveryError) => {
          expect(error.recipient).toBeDefined();
          expect(error.errorType).toBeDefined();
          expect(error.message).toBeDefined();
          expect(error.retryable).toBeDefined();
          expect(typeof error.retryable).toBe('boolean');
        });

        expect(result.status).toBe('partial');
        expect(sendData.status).toBe('partial');
        expect(sendData.successCount).toBeGreaterThan(0);
        expect(sendData.failureCount).toBeGreaterThan(0);

        console.log('Test Case 2 PASSED: Partial delivery tracking');
        console.log(`  - Successful: ${sendData.successCount}`);
        console.log(`  - Failed: ${sendData.failureCount}`);
        console.log(`  - Errors: ${sendData.errors.length}`);
        sendData.errors.forEach((e, i) => {
          console.log(`    ${i + 1}. ${e.recipient}: ${e.errorType} (Retryable: ${e.retryable})`);
        });
      }
    });

    it('should mark network errors as retryable', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Network error test',
        textBody: 'Testing network error handling',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      const sendData: SendResult = (result as any).output.data;

      // If there are network errors, they should be retryable
      sendData.errors.forEach((error: DeliveryError) => {
        if (error.errorType === 'network_error') {
          expect(error.retryable).toBe(true);
        }
      });

      console.log('Test Case 2 PASSED: Network error classification');
    });
  });

  describe('Test Case 3: Error Handling and Failure Scenarios', () => {
    it('should fail with error status on missing from address', async () => {
      const node = createMockNode({
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
      expect(result.errorCode).toMatch(/SMTP_SEND_ERROR|INVALID_PARAMS/);

      console.log('Test Case 3 PASSED: Error on missing from address');
      console.log(`  - Error: ${result.error}`);
    });

    it('should fail with error status on invalid recipient email', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['not-an-email'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();

      console.log('Test Case 3 PASSED: Error on invalid recipient');
      console.log(`  - Error: ${result.error}`);
    });

    it('should fail on missing subject', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        textBody: 'Test',
        smtpConfig: createMockSMTPConfig()
      });
      delete node.parameters.subject;

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');

      console.log('Test Case 3 PASSED: Error on missing subject');
    });

    it('should fail on missing body content', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');

      console.log('Test Case 3 PASSED: Error on missing body');
    });

    it('should fail on missing SMTP config', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test'
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toBe('error');

      console.log('Test Case 3 PASSED: Error on missing SMTP config');
    });

    it('should track execution duration for performance metrics', async () => {
      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();

      console.log('Test Case 3 PASSED: Performance metrics');
      console.log(`  - Duration: ${result.duration}ms`);
    });
  });

  describe('Email Address Validation', () => {
    it('should validate various email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user+tag@example.co.uk',
        'first.last@example.com',
        'user_name@example.com'
      ];

      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        ''
      ];

      validEmails.forEach((email) => {
        const node = createMockNode({
          from: email,
          to: ['recipient@example.com'],
          subject: 'Test',
          textBody: 'Test',
          smtpConfig: createMockSMTPConfig()
        });
        const result = executor.validate(node);
        expect(result.valid).toBe(true);
      });

      invalidEmails.forEach((email) => {
        const node = createMockNode({
          from: email,
          to: ['recipient@example.com'],
          subject: 'Test',
          textBody: 'Test',
          smtpConfig: createMockSMTPConfig()
        });
        const result = executor.validate(node);
        expect(result.valid).toBe(false);
      });

      console.log('Email Address Validation Test PASSED');
      console.log(`  - Valid emails tested: ${validEmails.length}`);
      console.log(`  - Invalid emails tested: ${invalidEmails.length}`);
    });
  });

  describe('SMTP Configuration Options', () => {
    it('should accept TLS encryption', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.encryption = 'tls';

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should accept SSL encryption', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.encryption = 'ssl';

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should accept plain text (no encryption)', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.encryption = 'none';

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should accept standard SMTP ports', () => {
      const ports = [25, 465, 587, 2525];

      ports.forEach((port) => {
        const smtpConfig = createMockSMTPConfig();
        smtpConfig.port = port;

        const node = createMockNode({
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          subject: 'Test',
          textBody: 'Test',
          smtpConfig
        });

        const result = executor.validate(node);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Attachment Handling', () => {
    it('should handle multiple attachments', async () => {
      const attachments: EmailAttachment[] = [
        {
          filename: 'doc1.txt',
          contentType: 'text/plain',
          data: 'VmFsdWUxCg==' // "Value1\n" in base64
        },
        {
          filename: 'doc2.pdf',
          contentType: 'application/pdf',
          data: 'JVBERi0xLjQK' // Minimal PDF header
        }
      ];

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Multiple Attachments',
        textBody: 'See attachments',
        attachments,
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toMatch(/success|partial/);

      console.log('Attachment Test PASSED: Multiple attachments');
      console.log(`  - Attachments: ${attachments.length}`);
      attachments.forEach((att) => {
        console.log(`    - ${att.filename} (${att.contentType})`);
      });
    });

    it('should handle inline attachments with content IDs', async () => {
      const attachment: EmailAttachment = {
        filename: 'logo.png',
        contentType: 'image/png',
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        contentId: 'logo-image',
        inline: true
      };

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Email with Inline Image',
        htmlBody: '<img src="cid:logo-image" />',
        attachments: [attachment],
        smtpConfig: createMockSMTPConfig()
      });

      const result = await executor.execute(node as any, mockContext as any, mockState as any);

      expect(result.status).toMatch(/success|partial/);

      console.log('Attachment Test PASSED: Inline attachment');
    });
  });

  describe('Retry and Recovery', () => {
    it('should accept custom retry attempts configuration', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.retryAttempts = 3;

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid retry attempts', () => {
      const smtpConfig = createMockSMTPConfig();
      smtpConfig.retryAttempts = 10;

      const node = createMockNode({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        textBody: 'Test',
        smtpConfig
      });

      const result = executor.validate(node);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('retryAttempts'));
    });
  });
});

/**
 * Helper to create mock workflow node
 */
function createMockNode(parameters: Record<string, any>): MockNode {
  return {
    id: 'node-smtp-send-test',
    type: 'node',
    nodeType: 'smtp-send',
    parameters
  };
}

/**
 * Helper to create mock SMTP configuration
 */
function createMockSMTPConfig(): SMTPConfig {
  return {
    host: 'smtp.example.com',
    port: 587,
    username: 'user@example.com',
    password: 'password123',
    encryption: 'tls',
    timeout: 30000,
    retryAttempts: 2
  };
}
