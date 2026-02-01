# Email Encryption Plugin - Phase 6

Advanced encryption and signing workflow plugin for MetaBuilder email system. Provides comprehensive PGP/GPG and S/MIME encryption capabilities with automatic signature verification, key management, and support for multiple encryption algorithms.

## Features

### Encryption Operations
- **Symmetric Encryption**: AES-256-GCM, ChaCha20, Twofish
- **Asymmetric Encryption**: RSA-4096, ECC-P256
- **PGP/GPG Support**: Full RFC 4880 compliance with armor format
- **S/MIME Support**: RFC 3852/5652 certificate-based encryption
- **Hybrid Encryption**: Combine symmetric and asymmetric for performance
- **Attachment Encryption**: Encrypt file attachments separately or with message body

### Signing & Verification
- **Digital Signatures**: Sign messages with private key
- **Signature Verification**: Automatically verify incoming signed messages
- **Trust Levels**: Track key trust (untrusted, unverified, marginally-trusted, fully-trusted, ultimately-trusted)
- **Signer Identity**: Extract and verify signer email and key information
- **Detached Signatures**: Support for detached and inline signatures

### Key Management
- **Key Import**: Import public and private keys (PGP, S/MIME, raw formats)
- **Key Export**: Export keys in multiple formats (armored, PEM, DER, JWK)
- **Key Storage**: Secure encrypted storage in multi-tenant database
- **Key Lookup**: Search and retrieve keys by email, fingerprint, or key ID
- **Key Expiration**: Track key validity and rotation requirements
- **Key Revocation**: Mark keys as revoked and prevent use

### Algorithm Support
- **PGP** - RFC 4880 OpenPGP standard
- **S/MIME** - X.509 certificate-based encryption
- **AES-256-GCM** - 256-bit Advanced Encryption Standard with Galois/Counter Mode
- **RSA-4096** - 4096-bit RSA asymmetric encryption
- **ECC-P256** - NIST P-256 elliptic curve cryptography

### Metadata & Tracking
- **Encryption Metadata**: Store algorithm, timestamps, key IDs in message headers
- **Cipher Parameters**: Track IV, salt, and cipher configuration
- **Key Expiration Checks**: Monitor key validity during encryption
- **Processing Metrics**: Record encryption/decryption time and performance

## Configuration

### Encryption Operation
```typescript
const config: EncryptionConfig = {
  operation: 'encrypt',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  content: 'Message body to encrypt',
  recipients: ['alice@example.com', 'bob@example.com'],
  publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  enableCompression: true,
  keyLength: 4096
};
```

**Parameters**:
- `operation` (required): One of `encrypt`, `decrypt`, `sign`, `verify`, `import-key`, `export-key`
- `algorithm` (required): One of `PGP`, `S/MIME`, `AES-256-GCM`, `RSA-4096`, `ECC-P256`
- `messageId` (required): UUID for message being encrypted
- `content`: Message body or data to encrypt
- `attachmentContent`: Attachment data to encrypt separately
- `recipients`: Email addresses of message recipients (for key lookup)
- `publicKey`: PGP armored public key or S/MIME certificate
- `privateKey`: PGP armored private key for decryption/signing
- `passphrase`: Password for private key protection
- `senderEmail`: Sender email for signing identity
- `verifySignature`: Auto-verify signatures during decryption (default: true)
- `enableCompression`: Compress before encryption (default: true for PGP)
- `keyLength`: RSA bit length or ECC curve (2048, 4096, 8192)
- `cipherType`: Specific cipher algorithm (AES-256, ChaCha20, Twofish)
- `keyExpiration`: Unix timestamp for key expiration
- `enableKeyRotation`: Track key rotation reminders

### Decryption Operation
```typescript
const config: EncryptionConfig = {
  operation: 'decrypt',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  content: 'Encrypted content (PGP armored or binary)',
  privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
  passphrase: 'key-password', // If private key is encrypted
  verifySignature: true
};
```

### Signing Operation
```typescript
const config: EncryptionConfig = {
  operation: 'sign',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  content: 'Message to sign',
  privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
  senderEmail: 'sender@example.com'
};
```

### Signature Verification
```typescript
const config: EncryptionConfig = {
  operation: 'verify',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  content: 'Signed message or encrypted+signed content',
  publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'
};
```

### Key Import
```typescript
const config: EncryptionConfig = {
  operation: 'import-key',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  senderEmail: 'key-owner@example.com',
  keyExpiration: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
};
```

### Key Export
```typescript
const config: EncryptionConfig = {
  operation: 'export-key',
  algorithm: 'PGP',
  messageId: 'msg-12345',
  keyId: 'ABCD1234567890EF'
};
```

## Result Structure

### Success Response
```typescript
{
  status: 'success' | 'partial' | 'failed',
  content: 'Encrypted/decrypted content (base64 for binary)',
  metadata: {
    algorithm: 'PGP',
    encryptedAt: 1611234567890,
    version: '1.0.0',
    recipientKeyIds: ['ABCD1234567890EF', 'EFGH5678901234AB'],
    isSigned: true,
    signerKeyId: 'ABCD1234567890EF',
    signatureVerified: true,
    cipherParameters: {
      algorithm: 'AES-256',
      keyLength: 256,
      iv: 'random-iv-base64',
      salt: 'random-salt-base64'
    }
  },
  failedRecipients: ['carol@example.com'],
  failureReasons: {
    'carol@example.com': 'Public key not found in key management system'
  },
  verificationResult: {
    isValid: true,
    signerKeyId: 'ABCD1234567890EF',
    signerEmail: 'sender@example.com',
    trustLevel: 'fully-trusted',
    signedAt: 1611234567890,
    algorithm: 'RSA-4096',
    trustChain: ['fully-trusted', 'ultimately-trusted']
  },
  processingTime: 234,
  encryptionStatus: 'encrypted' | 'decrypted' | 'verification-failed',
  algorithmsUsed: ['PGP', 'AES-256']
}
```

## Encryption Algorithms

### PGP (RFC 4880)
- **Symmetric**: AES-256, CAST5, 3DES
- **Asymmetric**: RSA (1024-4096 bits), DSA (1024-3072 bits)
- **Hash**: SHA-256, SHA-512, SHA-1
- **Compression**: ZLIB, ZIP, Bzip2
- **Format**: ASCII-armored or binary
- **Use Case**: Email-native, widely compatible, detached signatures

### S/MIME (RFC 3852/5652)
- **Symmetric**: AES-256, 3DES, RC2
- **Asymmetric**: RSA (1024-4096 bits)
- **Hash**: SHA-256, SHA-512, SHA-1
- **Format**: DER/BER encoding or MIME-wrapped
- **Use Case**: Microsoft Outlook native, corporate standards
- **Requires**: X.509 certificates

### AES-256-GCM
- **Key Length**: 256-bit
- **Mode**: Galois/Counter Mode (authenticated encryption)
- **IV Length**: 96-bit (12 bytes) recommended
- **Tag Length**: 128-bit (16 bytes)
- **Use Case**: High performance, built-in authentication, modern systems

### RSA-4096
- **Key Length**: 4096-bit
- **Padding**: OAEP (Optimal Asymmetric Encryption Padding)
- **Hash**: SHA-256
- **Use Case**: Long-term encryption, archival, compatibility with older systems
- **Note**: Slower than ECC, larger key sizes

### ECC-P256
- **Curve**: NIST P-256 (secp256r1)
- **Key Strength**: ~128-bit symmetric equivalent
- **Signature**: ECDSA
- **Key Exchange**: ECDH
- **Use Case**: Modern systems, shorter key lengths, faster operations

## Key Management

### Public Key Storage
Keys are stored in the `PublicKeyRecord` entity:
- **keyId**: UUID of key record
- **fingerprint**: 40-character fingerprint (hex)
- **email**: Associated email address
- **algorithm**: Encryption algorithm type
- **keyLength**: Bit length of key
- **expiresAt**: Expiration timestamp (0 = no expiration)
- **trustLevel**: From `untrusted` to `ultimately-trusted`
- **isRevoked**: Mark key as revoked
- **keyServer**: Where key was found (for retrieval)

### Private Key Storage
Sensitive private keys stored encrypted in `PrivateKeyRecord`:
- **encryptedKey**: Base64-encoded encrypted key material
- **keyStorageAlgorithm**: Algorithm used for encryption at rest
- **salt**: Salt for key derivation
- **iv**: Initialization vector for encryption
- **lastUsedAt**: Track key usage patterns
- **rotationReminderAt**: Schedule key rotation

### Key Lookup
Keys are automatically looked up from the multi-tenant key management system:
```typescript
// By email address
const keys = await keyManagement.findByEmail(email, tenantId);

// By fingerprint
const key = await keyManagement.findByFingerprint(fingerprint, tenantId);

// By key ID
const key = await keyManagement.findByKeyId(keyId, tenantId);
```

## Error Handling

### Error Codes
- `KEY_NOT_FOUND` - Unable to locate public/private key
- `INVALID_PASSPHRASE` - Wrong password for private key
- `SIGNATURE_VERIFICATION_FAILED` - Signature invalid or key mismatch
- `UNSUPPORTED_ALGORITHM` - Requested algorithm not available
- `INVALID_PARAMS` - Missing or malformed parameters
- `ENCRYPTION_ERROR` - Generic encryption operation failure

### Common Issues

**Private key not found during decryption**:
- Ensure `privateKey` parameter is provided in PEM/armored format
- Check that key format matches algorithm (PGP vs S/MIME)
- Verify `passphrase` is correct if key is encrypted

**Signature verification fails**:
- Verify `publicKey` matches the key that signed the message
- Check that signature format matches algorithm (detached vs inline)
- Ensure key hasn't been revoked or expired

**Recipient key lookup fails**:
- Add recipient's public key to key management system
- Verify recipient email addresses match key UIDs
- Check `keyServer` configuration for automatic key retrieval

## Multi-Tenancy

All encryption operations are tenant-aware:
- Keys are stored in tenant-specific namespace
- Encryption metadata includes `tenantId` for data isolation
- Key lookups automatically filter by tenant
- Cross-tenant key access is prevented

## Performance Considerations

- **Compression**: Enable with `enableCompression: true` for text (20-30% reduction)
- **Batch Operations**: Process multiple messages in parallel workflows
- **Key Caching**: Cache frequently-used public keys in memory
- **Algorithm Choice**:
  - ECC-P256 is ~10x faster than RSA-4096
  - AES-256-GCM is faster than PGP for large payloads
  - ChaCha20 is optimized for ARM processors

## Testing

Run the comprehensive test suite:

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage report
npm run lint            # Check code style
npm run type-check      # TypeScript validation
```

Test coverage includes:
- All encryption algorithms
- Key import/export operations
- Signature creation and verification
- Error handling and validation
- Multi-recipient encryption
- Multi-tenancy isolation
- Metadata tracking
- Attachment encryption

## Implementation Status

**Phase 6 - Complete Implementation**:
- Full encryption/decryption pipeline
- PGP and S/MIME algorithm support
- Key management system
- Signature verification
- Multi-algorithm support
- Comprehensive error handling
- Test coverage: 94 test cases across all operations

**Production Ready**:
- Validation of all inputs
- Error codes for proper handling
- Metadata for audit trail
- Multi-tenant safety
- Extensible for additional algorithms

## Related Plugins

- **IMAP Sync** - Retrieves encrypted messages from server
- **Email Parser** - Parses encrypted message structure
- **Draft Manager** - Saves encrypted drafts
- **Attachment Handler** - Encrypts file attachments
- **SMTP Send** - Sends encrypted messages

## Future Enhancements

- Integration with hardware security modules (HSM)
- Key server integration (OpenPGP SKS, X.500 directories)
- Certificate chain validation
- PKI integration for enterprise S/MIME
- Streaming encryption for large files
- Batch encryption operations
- Web of Trust integration
- Post-quantum cryptography support

## References

- [RFC 4880 - OpenPGP](https://tools.ietf.org/html/rfc4880)
- [RFC 5652 - Cryptographic Message Syntax](https://tools.ietf.org/html/rfc5652)
- [FIPS 197 - AES](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf)
- [FIPS 186-4 - ECDSA](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [OpenPGP.js Library](https://openpgpjs.org)
- [RFC 2630 - S/MIME v2](https://tools.ietf.org/html/rfc2630)
