/**
 * Email Encryption Plugin Test Suite - Phase 6
 * Comprehensive tests for PGP/S/MIME encryption, signing, key management
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  EncryptionExecutor,
  EncryptionConfig,
  EncryptionResult,
  EncryptionAlgorithm,
  EncryptionOperation,
  EncryptionStatus,
  EncryptionMetadata,
  SignatureVerification,
  PublicKeyRecord,
  PrivateKeyRecord
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

/**
 * Mock sample keys for testing
 */
const MOCK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2jwplBCPvzBcpZBx4v
hVDhQdQJxDqCGiJHPKG4WxX7Y0Z8Z7J4R4L9M3H1Q2Q3P1X6V5X9Z9J3L7J4L2H5
-----END PUBLIC KEY-----`;

const MOCK_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZraPCmUEM+/MF
ylkHHi+FUOFh1AnEOoIaIkc8obhbFftjRnxnsniHgv0zcfVDZDc/RflX9f9Z8yc=
-----END PRIVATE KEY-----`;

const MOCK_EMAIL = 'test@example.com';
const MOCK_MESSAGE_ID = 'msg-12345';
const MOCK_CONTENT = 'This is a test message for encryption';
const MOCK_RECIPIENTS = ['alice@example.com', 'bob@example.com'];

/**
 * Helper to create mock node
 */
function createMockNode(parameters: Partial<EncryptionConfig>): MockNode {
  return {
    id: `node-${Math.random()}`,
    type: 'encryption',
    nodeType: 'encryption',
    parameters: {
      operation: 'encrypt',
      algorithm: 'PGP',
      messageId: MOCK_MESSAGE_ID,
      ...parameters
    }
  };
}

/**
 * Helper to create mock context
 */
function createMockContext(): MockContext {
  return {
    executionId: 'exec-123',
    tenantId: 'tenant-acme',
    userId: 'user-456',
    triggerData: {},
    variables: {}
  };
}

describe('EncryptionExecutor - Phase 6', () => {
  let executor: EncryptionExecutor;
  let mockContext: MockContext;
  let mockState: MockState;

  beforeEach(() => {
    executor = new EncryptionExecutor();
    mockContext = createMockContext();
    mockState = {};
  });

  describe('Node Type and Metadata', () => {
    it('should have correct node type identifier', () => {
      expect(executor.nodeType).toBe('encryption');
    });

    it('should have correct category', () => {
      expect(executor.category).toBe('email-integration');
    });

    it('should have descriptive description', () => {
      expect(executor.description).toContain('PGP');
      expect(executor.description).toContain('S/MIME');
      expect(executor.description).toContain('encryption');
    });
  });

  describe('Validation - Encryption Operation', () => {
    it('should reject missing operation', () => {
      const node = createMockNode({ operation: '' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Operation'))).toBe(true);
    });

    it('should reject invalid operation', () => {
      const node = createMockNode({ operation: 'invalid-op' as EncryptionOperation });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid operation'))).toBe(true);
    });

    it('should accept valid operations', () => {
      const operations: EncryptionOperation[] = ['encrypt', 'decrypt', 'sign', 'verify', 'import-key', 'export-key'];

      for (const op of operations) {
        const node = createMockNode({ operation: op });
        const result = executor.validate(node);
        expect(result.valid).toBe(true, `Operation ${op} should be valid`);
      }
    });
  });

  describe('Validation - Algorithm', () => {
    it('should reject missing algorithm', () => {
      const node = createMockNode({ algorithm: '' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Algorithm'))).toBe(true);
    });

    it('should reject invalid algorithm', () => {
      const node = createMockNode({ algorithm: 'INVALID' as EncryptionAlgorithm });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid algorithm'))).toBe(true);
    });

    it('should accept all valid algorithms', () => {
      const algorithms: EncryptionAlgorithm[] = ['PGP', 'S/MIME', 'AES-256-GCM', 'RSA-4096', 'ECC-P256'];

      for (const algo of algorithms) {
        const node = createMockNode({ algorithm: algo });
        const result = executor.validate(node);
        expect(result.valid).toBe(true, `Algorithm ${algo} should be valid`);
      }
    });
  });

  describe('Validation - Message ID', () => {
    it('should reject missing messageId', () => {
      const node = createMockNode({ messageId: '' });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Message ID'))).toBe(true);
    });

    it('should accept valid messageId', () => {
      const node = createMockNode({ messageId: 'msg-123' });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Encrypt Operation', () => {
    it('should require content or attachmentContent for encryption', () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: '',
        attachmentContent: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Content'))).toBe(true);
    });

    it('should require recipients for encryption', () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: []
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Recipients'))).toBe(true);
    });

    it('should accept valid encryption parameters', () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS,
        publicKey: MOCK_PUBLIC_KEY
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Decrypt Operation', () => {
    it('should require content for decryption', () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Content'))).toBe(true);
    });

    it('should warn on missing private key for decryption', () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: MOCK_CONTENT,
        privateKey: ''
      });
      const result = executor.validate(node);

      expect(result.warnings.some(w => w.includes('Private key'))).toBe(true);
    });

    it('should accept valid decryption parameters', () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: MOCK_CONTENT,
        privateKey: MOCK_PRIVATE_KEY
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Sign Operation', () => {
    it('should require content for signing', () => {
      const node = createMockNode({
        operation: 'sign',
        content: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Content'))).toBe(true);
    });

    it('should require private key for signing', () => {
      const node = createMockNode({
        operation: 'sign',
        content: MOCK_CONTENT,
        privateKey: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Private key'))).toBe(true);
    });

    it('should warn on missing sender email for signing', () => {
      const node = createMockNode({
        operation: 'sign',
        content: MOCK_CONTENT,
        privateKey: MOCK_PRIVATE_KEY,
        senderEmail: ''
      });
      const result = executor.validate(node);

      expect(result.warnings.some(w => w.includes('Sender email'))).toBe(true);
    });

    it('should accept valid signing parameters', () => {
      const node = createMockNode({
        operation: 'sign',
        content: MOCK_CONTENT,
        privateKey: MOCK_PRIVATE_KEY,
        senderEmail: MOCK_EMAIL
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Import Key Operation', () => {
    it('should require key for import', () => {
      const node = createMockNode({
        operation: 'import-key',
        publicKey: '',
        privateKey: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('key is required'))).toBe(true);
    });

    it('should accept public key for import', () => {
      const node = createMockNode({
        operation: 'import-key',
        publicKey: MOCK_PUBLIC_KEY
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });

    it('should accept private key for import', () => {
      const node = createMockNode({
        operation: 'import-key',
        privateKey: MOCK_PRIVATE_KEY
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Export Key Operation', () => {
    it('should require key ID for export', () => {
      const node = createMockNode({
        operation: 'export-key',
        keyId: ''
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Key ID'))).toBe(true);
    });

    it('should accept valid export parameters', () => {
      const node = createMockNode({
        operation: 'export-key',
        keyId: 'key-12345'
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Validation - Key Length', () => {
    it('should reject invalid key lengths', () => {
      const node = createMockNode({
        keyLength: 1024 // Invalid, must be 2048, 4096, or 8192
      });
      const result = executor.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Key length'))).toBe(true);
    });

    it('should accept valid key lengths', () => {
      for (const length of [2048, 4096, 8192]) {
        const node = createMockNode({
          operation: 'encrypt',
          content: MOCK_CONTENT,
          recipients: MOCK_RECIPIENTS,
          keyLength: length
        });
        const result = executor.validate(node);

        expect(result.valid).toBe(true, `Key length ${length} should be valid`);
      }
    });
  });

  describe('Encryption Execution', () => {
    it('should execute encryption successfully', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'PGP',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS,
        publicKey: MOCK_PUBLIC_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.status).toBe('success');
      expect(result.output.data.encryptionStatus).toBe('encrypted');
      expect(result.output.data.algorithmsUsed).toContain('PGP');
      expect(result.output.data.metadata.isSigned).toBe(false);
    });

    it('should return processing time in milliseconds', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
      expect(result.output.data.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle encryption with signing', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'PGP',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS,
        privateKey: MOCK_PRIVATE_KEY,
        senderEmail: MOCK_EMAIL
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.metadata.isSigned).toBe(true);
    });

    it('should return recipient key IDs', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.metadata.recipientKeyIds).toBeDefined();
      expect(Array.isArray(result.output.data.metadata.recipientKeyIds)).toBe(true);
    });

    it('should return cipher parameters', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.metadata.cipherParameters).toBeDefined();
      expect(result.output.data.metadata.cipherParameters?.algorithm).toBeDefined();
      expect(result.output.data.metadata.cipherParameters?.keyLength).toBeGreaterThan(0);
    });
  });

  describe('Decryption Execution', () => {
    it('should execute decryption with content', async () => {
      const encryptedContent = 'AES-256:YWJjZGVmZ2g='; // Simulated encrypted

      const node = createMockNode({
        operation: 'decrypt',
        algorithm: 'PGP',
        content: encryptedContent,
        privateKey: MOCK_PRIVATE_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.encryptionStatus).toBe('decrypted');
    });

    it('should fail decryption without content', async () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: ''
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Content');
    });

    it('should verify signature during decryption if enabled', async () => {
      const encryptedContent = 'AES-256:YWJjZGVmZ2g=';

      const node = createMockNode({
        operation: 'decrypt',
        algorithm: 'PGP',
        content: encryptedContent,
        privateKey: MOCK_PRIVATE_KEY,
        publicKey: MOCK_PUBLIC_KEY,
        verifySignature: true
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
    });
  });

  describe('Signing Execution', () => {
    it('should execute signing successfully', async () => {
      const node = createMockNode({
        operation: 'sign',
        algorithm: 'PGP',
        content: MOCK_CONTENT,
        privateKey: MOCK_PRIVATE_KEY,
        senderEmail: MOCK_EMAIL
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.encryptionStatus).toBe('encrypted');
      expect(result.output.data.metadata.isSigned).toBe(true);
      expect(result.output.data.content).toContain('SIGNED MESSAGE');
    });

    it('should require private key for signing', async () => {
      const node = createMockNode({
        operation: 'sign',
        content: MOCK_CONTENT,
        privateKey: ''
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Private key');
    });
  });

  describe('Signature Verification', () => {
    it('should verify signature successfully', async () => {
      const signedContent = `-----BEGIN SIGNED MESSAGE-----
${MOCK_CONTENT}
-----BEGIN SIGNATURE-----
dGVzdCBzaWduYXR1cmU=
-----END SIGNATURE-----`;

      const node = createMockNode({
        operation: 'verify',
        algorithm: 'PGP',
        content: signedContent,
        publicKey: MOCK_PUBLIC_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.verificationResult).toBeDefined();
      expect(result.output.data.verificationResult?.isValid).toBe(true);
    });

    it('should fail verification without signature', async () => {
      const node = createMockNode({
        operation: 'verify',
        content: MOCK_CONTENT,
        publicKey: MOCK_PUBLIC_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('signature');
    });

    it('should return signer information', async () => {
      const signedContent = `-----BEGIN SIGNED MESSAGE-----
${MOCK_CONTENT}
-----BEGIN SIGNATURE-----
dGVzdCBzaWduYXR1cmU=
-----END SIGNATURE-----`;

      const node = createMockNode({
        operation: 'verify',
        content: signedContent,
        publicKey: MOCK_PUBLIC_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.verificationResult?.signerKeyId).toBeDefined();
      expect(result.output.data.verificationResult?.trustLevel).toBeDefined();
    });
  });

  describe('Key Import/Export', () => {
    it('should import public key successfully', async () => {
      const node = createMockNode({
        operation: 'import-key',
        algorithm: 'PGP',
        publicKey: MOCK_PUBLIC_KEY,
        senderEmail: MOCK_EMAIL
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.content).toBeDefined(); // Key ID
      expect(result.output.data.metadata.recipientKeyIds).toHaveLength(1);
    });

    it('should import private key successfully', async () => {
      const node = createMockNode({
        operation: 'import-key',
        algorithm: 'PGP',
        privateKey: MOCK_PRIVATE_KEY
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.content).toBeDefined();
    });

    it('should export key successfully', async () => {
      const node = createMockNode({
        operation: 'export-key',
        algorithm: 'PGP',
        keyId: 'test-key-12345'
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.content).toContain('KEY');
    });

    it('should require key ID for export', async () => {
      const node = createMockNode({
        operation: 'export-key',
        keyId: ''
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Key ID');
    });
  });

  describe('Algorithm Support', () => {
    it('should support PGP algorithm', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'PGP',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.algorithmsUsed).toContain('PGP');
    });

    it('should support S/MIME algorithm', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'S/MIME',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.algorithmsUsed).toContain('S/MIME');
    });

    it('should support AES-256-GCM algorithm', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'AES-256-GCM',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.algorithmsUsed).toContain('AES-256-GCM');
    });

    it('should support RSA-4096 algorithm', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'RSA-4096',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS,
        keyLength: 4096
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.algorithmsUsed).toContain('RSA-4096');
    });

    it('should support ECC-P256 algorithm', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        algorithm: 'ECC-P256',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.algorithmsUsed).toContain('ECC-P256');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing messageId in execution', async () => {
      const node = createMockNode({
        messageId: ''
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_PARAMS');
    });

    it('should handle missing encryption operation', async () => {
      const node = createMockNode({
        operation: '' as EncryptionOperation
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
    });

    it('should categorize key-related errors', async () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: 'encrypted-data'
        // Missing privateKey
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('KEY_NOT_FOUND');
    });

    it('should categorize signature errors', async () => {
      const node = createMockNode({
        operation: 'verify',
        content: 'unsigned-content'
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('SIGNATURE_VERIFICATION_FAILED');
    });

    it('should include processingTime even on error', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        messageId: ''
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metadata Tracking', () => {
    it('should include encryption timestamp', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.metadata.encryptedAt).toBeGreaterThan(0);
      expect(result.output.data.metadata.encryptedAt).toBeLessThanOrEqual(Date.now());
    });

    it('should track version information', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.metadata.version).toBeDefined();
      expect(result.output.data.metadata.version).toBe('1.0.0');
    });

    it('should track signing status', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.output.data.metadata.isSigned).toBeDefined();
      expect(typeof result.output.data.metadata.isSigned).toBe('boolean');
    });
  });

  describe('Attachment Encryption', () => {
    it('should encrypt attachment content', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        attachmentContent: 'binary-attachment-data',
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.encryptionStatus).toBe('encrypted');
    });

    it('should handle both message and attachment content', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        attachmentContent: 'attachment-data',
        recipients: MOCK_RECIPIENTS
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
    });
  });

  describe('Multi-Recipient Encryption', () => {
    it('should handle single recipient', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: ['single@example.com']
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.metadata.recipientKeyIds).toHaveLength(1);
    });

    it('should handle multiple recipients', async () => {
      const node = createMockNode({
        operation: 'encrypt',
        content: MOCK_CONTENT,
        recipients: ['alice@example.com', 'bob@example.com', 'charlie@example.com']
      });

      const result = await executor.execute(node, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.data.metadata.recipientKeyIds.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Passphrase Protection', () => {
    it('should accept passphrase for key operations', () => {
      const node = createMockNode({
        operation: 'decrypt',
        content: MOCK_CONTENT,
        privateKey: MOCK_PRIVATE_KEY,
        passphrase: 'secure-passphrase'
      });

      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });

  describe('Key Expiration', () => {
    it('should track key expiration timestamp', () => {
      const expirationTime = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year

      const node = createMockNode({
        operation: 'import-key',
        publicKey: MOCK_PUBLIC_KEY,
        keyExpiration: expirationTime
      });

      const result = executor.validate(node);

      expect(result.valid).toBe(true);
    });
  });
});
