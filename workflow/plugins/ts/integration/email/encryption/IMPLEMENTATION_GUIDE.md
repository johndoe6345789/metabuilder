# Email Encryption Plugin - Implementation Guide

Complete guide for integrating and extending the Phase 6 email encryption plugin.

## Architecture Overview

The encryption plugin follows a modular architecture with clear separation of concerns:

```
EncryptionExecutor (INodeExecutor interface)
├── Configuration Validation
├── Operation Router
│   ├── _encryptContent()      - Symmetric + asymmetric hybrid encryption
│   ├── _decryptContent()      - Symmetric decryption with verification
│   ├── _signContent()         - Digital signature creation
│   ├── _verifySignature()     - Signature verification
│   ├── _importKey()           - Key import and storage
│   └── _exportKey()           - Key export in multiple formats
├── Cryptographic Helpers
│   ├── _selectSymmetricCipher()      - Algorithm selection
│   ├── _generateSessionKey()         - Key generation
│   ├── _encryptSymmetric()           - Symmetric encryption
│   ├── _decryptSymmetric()           - Symmetric decryption
│   ├── _hashContent()                - Content hashing
│   ├── _createSignature()            - Signature creation
│   └── _verifySignatureContent()     - Signature verification
└── Key Management Helpers
    ├── _extractKeyId()               - Parse key ID from key material
    ├── _extractFingerprint()         - Parse fingerprint
    ├── _extractEmailFromKey()        - Parse email from key UID
    ├── _generateKeyId()              - Generate key ID
    └── _generateRandom()             - Random byte generation
```

## Integration Points

### 1. DBAL Integration

Connect to multi-tenant key management entities:

```typescript
// Import DBAL types
import { getDBALClient, type TenantContext } from '@metabuilder/dbal';

// In _executeOperation() method:
const dbal = getDBALClient();

// Store public key
const publicKeyRecord = await dbal.publicKeys.create({
  tenantId: context.tenantId,
  fingerprint: extraction.fingerprint,
  email: extraction.email,
  algorithm: config.algorithm,
  publicKey: config.publicKey,
  trustLevel: 'unverified'
});

// Lookup key by email
const keys = await dbal.publicKeys.list({
  filter: {
    tenantId: context.tenantId,
    email: recipient
  }
});

// Store encrypted private key
const privateKeyRecord = await dbal.privateKeys.create({
  tenantId: context.tenantId,
  fingerprint: extraction.fingerprint,
  encryptedKey: encrypted,
  algorithm: config.algorithm
});
```

### 2. Workflow Engine Integration

The plugin hooks into the MetaBuilder workflow engine:

```typescript
// Registered in workflow/plugins/registry/
export const ENCRYPTION_NODE = {
  nodeType: 'encryption',
  category: 'email-integration',
  executor: encryptionExecutor,
  parameterSchema: {
    type: 'object',
    properties: {
      operation: { enum: ['encrypt', 'decrypt', 'sign', 'verify', 'import-key', 'export-key'] },
      algorithm: { enum: ['PGP', 'S/MIME', 'AES-256-GCM', 'RSA-4096', 'ECC-P256'] },
      messageId: { type: 'string' },
      content: { type: 'string' }
      // ... additional properties
    }
  },
  inputs: [
    { name: 'main', type: 'main', maxConnections: 1 },
    { name: 'error', type: 'error', maxConnections: 1 }
  ],
  outputs: [
    { name: 'success', type: 'success', dataTypes: ['EncryptionResult'] },
    { name: 'error', type: 'error', dataTypes: ['Error'] }
  ]
};
```

### 3. Email Plugin Integration

Update the email plugin index to export encryption executor:

```typescript
// In workflow/plugins/ts/integration/email/index.ts
export {
  encryptionExecutor,
  EncryptionExecutor,
  type EncryptionConfig,
  type EncryptionResult,
  type EncryptionMetadata,
  type SignatureVerification,
  type PublicKeyRecord,
  type PrivateKeyRecord
} from './encryption/src/index';
```

### 4. Message Processing Pipeline

Wire encryption into the email message pipeline:

```typescript
// In email-parser or draft-manager
import { encryptionExecutor, type EncryptionConfig } from '@metabuilder/workflow-plugin-encryption';

// Before sending message
const encryptionConfig: EncryptionConfig = {
  operation: 'encrypt',
  algorithm: 'PGP',
  messageId: message.id,
  content: message.body,
  recipients: message.to,
  publicKey: // fetch from key management
};

const encryptionResult = await encryptionExecutor.execute(encryptNode, context, state);

if (encryptionResult.status === 'success') {
  message.encryptedBody = encryptionResult.output.data.content;
  message.encryptionMetadata = encryptionResult.output.data.metadata;
}
```

## Extending the Plugin

### Adding New Algorithms

To add a new encryption algorithm:

1. **Define algorithm type**:
```typescript
export type EncryptionAlgorithm = 'PGP' | 'S/MIME' | 'AES-256-GCM' | 'RSA-4096' | 'ECC-P256' | 'YOUR_ALGORITHM';
```

2. **Implement cipher selection**:
```typescript
private _selectSymmetricCipher(algorithm: EncryptionAlgorithm): string {
  switch (algorithm) {
    case 'YOUR_ALGORITHM':
      return 'YOUR_CIPHER_NAME';
    // ... rest
  }
}
```

3. **Add encryption logic**:
```typescript
private async _encryptWithYourAlgorithm(
  content: string,
  sessionKey: string,
  config: EncryptionConfig
): Promise<string> {
  // Implementation using your crypto library
}
```

4. **Add validation**:
```typescript
if (node.parameters.algorithm === 'YOUR_ALGORITHM') {
  // Your algorithm-specific validation
}
```

### Integration with External Key Servers

Add key server integration for automatic key retrieval:

```typescript
// In _encryptContent() method
private async _fetchPublicKeyFromServer(
  email: string,
  keyServer: string
): Promise<string> {
  // Implement key server lookup (SKS, X.500, etc.)
  const response = await fetch(
    `${keyServer}/api/v1/keys?email=${email}`
  );
  const keyData = await response.json();
  return keyData.publicKey;
}
```

### Hardware Security Module (HSM) Support

Extend for HSM-based key operations:

```typescript
interface HSMConfig {
  endpoint: string;
  authentication: 'mTLS' | 'API_KEY';
  keyLabel: string;
}

private async _signWithHSM(
  contentHash: string,
  hsmConfig: HSMConfig
): Promise<string> {
  // Send signature request to HSM
  const response = await fetch(`${hsmConfig.endpoint}/sign`, {
    method: 'POST',
    body: JSON.stringify({ contentHash, keyLabel: hsmConfig.keyLabel })
  });
  return response.json().signature;
}
```

## Data Models

### PublicKeyRecord Entity
Store in DBAL `public_keys` entity:

```yaml
# dbal/shared/api/schema/entities/email/public_keys.yaml
name: public_keys
type: entity
fields:
  keyId:
    type: uuid
    primary: true
  tenantId:
    type: uuid
    required: true
    index: true
  fingerprint:
    type: string
    length: 40
    required: true
    unique: [tenantId]
  email:
    type: string
    required: true
    index: [tenantId]
  algorithm:
    type: enum
    values: [PGP, S/MIME, AES-256-GCM, RSA-4096, ECC-P256]
  keyLength:
    type: integer
  publicKey:
    type: text
    required: true
  expiresAt:
    type: bigint
    default: 0
  isRevoked:
    type: boolean
    default: false
  trustLevel:
    type: enum
    values: [untrusted, unverified, marginally-trusted, fully-trusted, ultimately-trusted]
  keyServer:
    type: string
    nullable: true
  createdAt:
    type: bigint
    required: true
  updatedAt:
    type: bigint
    required: true
```

### PrivateKeyRecord Entity
Store in DBAL `private_keys` entity (encrypted):

```yaml
name: private_keys
type: entity
fields:
  keyId:
    type: uuid
    primary: true
  tenantId:
    type: uuid
    required: true
    index: true
  fingerprint:
    type: string
    length: 40
    required: true
  email:
    type: string
    required: true
  encryptedKey:
    type: text
    required: true
  keyStorageAlgorithm:
    type: enum
    values: [PGP, S/MIME, AES-256-GCM, RSA-4096, ECC-P256]
  salt:
    type: string
    nullable: true
  iv:
    type: string
    nullable: true
  algorithm:
    type: enum
    values: [PGP, S/MIME, AES-256-GCM, RSA-4096, ECC-P256]
  lastUsedAt:
    type: bigint
    nullable: true
  rotationReminderAt:
    type: bigint
    nullable: true
  createdAt:
    type: bigint
    required: true
```

## Security Considerations

### Key Storage Best Practices

1. **Encrypt Private Keys at Rest**:
```typescript
// Always encrypt before storing
const encrypted = await this._encryptPrivateKey(
  privateKey,
  userPassphrase
);
```

2. **Secure Key Deletion**:
```typescript
// Overwrite key material from memory
private _secureDelete(data: string): void {
  const buffer = Buffer.from(data);
  buffer.fill(0);
}
```

3. **Access Control**:
```typescript
// Verify tenant ownership before decryption
const key = await dbal.privateKeys.get(keyId);
if (key.tenantId !== context.tenantId) {
  throw new Error('Unauthorized key access');
}
```

### Passphrase Handling

1. **Key Derivation**:
```typescript
// Use PBKDF2 or Argon2
const derivedKey = await scrypt(passphrase, salt, keyLength, {
  N: 16384,
  r: 8,
  p: 1
});
```

2. **Secure Comparison**:
```typescript
// Use constant-time comparison
const match = crypto.timingSafeEqual(
  computed,
  provided
);
```

## Testing Strategy

### Unit Tests Coverage

- Algorithm selection
- Encryption/decryption correctness
- Signature creation/verification
- Key import/export parsing
- Error handling for all operations
- Metadata generation

### Integration Tests

- End-to-end encryption/decryption with real keys
- Multi-recipient encryption scenarios
- Signature chain verification
- Key management persistence
- Multi-tenancy isolation

### Example Test

```typescript
it('should encrypt and decrypt message successfully', async () => {
  // Generate test key pair
  const { publicKey, privateKey } = await generateKeyPair();

  // Encrypt
  const encryptNode = createMockNode({
    operation: 'encrypt',
    content: TEST_MESSAGE,
    recipients: [TEST_EMAIL],
    publicKey
  });
  const encrypted = await executor.execute(encryptNode, context, state);

  // Decrypt
  const decryptNode = createMockNode({
    operation: 'decrypt',
    content: encrypted.output.data.content,
    privateKey,
    verifySignature: false
  });
  const decrypted = await executor.execute(decryptNode, context, state);

  expect(decrypted.output.data.content).toBe(TEST_MESSAGE);
});
```

## Performance Optimization

### Caching Strategies

```typescript
// Cache frequently-used public keys
private keyCache = new Map<string, PublicKeyRecord>();

private async _getPublicKey(email: string, tenantId: string): Promise<PublicKeyRecord> {
  const cacheKey = `${tenantId}:${email}`;
  if (this.keyCache.has(cacheKey)) {
    return this.keyCache.get(cacheKey)!;
  }

  const key = await dbal.publicKeys.get(email, tenantId);
  this.keyCache.set(cacheKey, key);

  // Clear cache after 1 hour
  setTimeout(() => this.keyCache.delete(cacheKey), 3600000);

  return key;
}
```

### Batch Operations

```typescript
// Process multiple recipients in parallel
const encryptedSessions = await Promise.all(
  config.recipients!.map(recipient =>
    this._encryptSessionKeyForRecipient(sessionKey, recipient)
  )
);
```

## Debugging

### Enable Logging

```typescript
private _log(operation: string, message: string, data?: any): void {
  if (process.env.DEBUG_ENCRYPTION) {
    console.log(`[Encryption ${operation}]`, message, data);
  }
}
```

### Common Debugging Scenarios

1. **Key not found**:
   - Check key lookup is using correct email/fingerprint
   - Verify tenant isolation isn't blocking key access
   - Ensure key hasn't been revoked

2. **Signature verification fails**:
   - Verify signature format (detached vs inline)
   - Check algorithm matches key type
   - Ensure no key rotation between signing and verification

3. **Decryption fails**:
   - Validate encrypted content format
   - Check private key is for recipient
   - Verify key hasn't expired

## Deployment

### Prerequisites

1. **DBAL Setup**:
   - Create `public_keys` and `private_keys` tables
   - Configure encryption at rest for private keys table
   - Set up indexes on `tenantId`, `email`, `fingerprint`

2. **Node.js Dependencies**:
   ```bash
   npm install openpgp libsodium.js node-rsa @noble/curves
   ```

3. **Environment Variables**:
   ```
   ENCRYPTION_KEY_STORAGE_PATH=/secure/keys
   ENCRYPTION_KEY_ROTATION_DAYS=365
   ENCRYPTION_ALGORITHM_DEFAULT=PGP
   ```

### Configuration

1. **Register with Workflow Engine**:
   ```typescript
   nodeExecutorRegistry.register(encryptionExecutor);
   ```

2. **Configure Key Servers** (optional):
   ```typescript
   const KEY_SERVERS = {
     pgp: 'https://keys.openpgp.org',
     smime: 'ldap://x500.company.com'
   };
   ```

3. **Set Trust Defaults**:
   ```typescript
   const DEFAULT_TRUST_LEVEL: TrustLevel = 'unverified';
   ```

## Monitoring

### Metrics to Track

- Encryption operations per second
- Average encryption/decryption time by algorithm
- Key lookup cache hit rate
- Failed encryption operations (by reason)
- Key expiration alerts
- Invalid signature detections

### Logging

```typescript
// Log security events
logger.info('key_imported', {
  keyId: publicKey.keyId,
  algorithm: publicKey.algorithm,
  tenantId: context.tenantId
});

logger.warn('signature_verification_failed', {
  messageId: config.messageId,
  signerKeyId: verification.signerKeyId
});
```

## References

- [OpenPGP.js Documentation](https://docs.openpgpjs.org/)
- [libsodium Documentation](https://doc.libsodium.org/)
- [NIST Cryptographic Recommendations](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
