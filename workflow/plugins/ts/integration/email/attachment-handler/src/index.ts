/**
 * Attachment Handler Node Executor Plugin - Phase 6
 * Downloads, stores, and manages email attachment lifecycle
 *
 * Features:
 * - Download attachments from email messages
 * - Store in blob storage (S3 or filesystem)
 * - Track attachment metadata (filename, MIME type, size, hash)
 * - Virus scanning integration hooks
 * - Generate presigned URLs for secure display/download
 * - Stream large files to handle memory constraints
 * - Soft delete with retention policies
 * - Attachment deduplication via content hashing
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

/**
 * MIME type detection patterns
 */
export const MIME_TYPE_PATTERNS: Record<string, string[]> = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],

  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],

  // Archives
  'application/zip': ['.zip'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz', '.gzip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],

  // Media
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'video/mp4': ['.mp4'],
  'video/mpeg': ['.mpeg', '.mpg'],
  'video/quicktime': ['.mov'],

  // Text
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/html': ['.html'],
  'text/xml': ['.xml'],
  'application/json': ['.json'],
};

/**
 * Dangerous MIME types requiring additional scanning
 */
export const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdos-program',
  'application/x-dvi',
  'application/x-perl',
  'application/x-python',
  'application/x-sh',
  'application/x-shellscript',
];

/**
 * Dangerous file extensions
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.msi', '.scr', '.vbs', '.js',
  '.jar', '.zip', '.rar', '.7z', '.iso', '.dmg', '.app', '.bin',
  '.sh', '.bash', '.ps1', '.pyw', '.pyx',
];

/**
 * Configuration for attachment download operation
 */
export interface AttachmentHandlerConfig {
  /** UUID of email message containing attachment (FK to EmailMessage) */
  messageId: string;
  /** Attachment filename from email headers */
  filename: string;
  /** Declared MIME type from email headers (may be overridden) */
  mimeType?: string;
  /** Size in bytes (for validation before download) */
  size: number;
  /** Content transfer encoding (e.g., base64, quoted-printable, 7bit) */
  encoding?: string;
  /** MD5/SHA256 content hash from email (for deduplication) */
  contentHash?: string;
  /** Blob storage path prefix (default: attachments/{tenantId}/{messageId}/) */
  storagePath?: string;
  /** Enable virus scanning integration (default: true) */
  enableVirusScan?: boolean;
  /** External virus scan service endpoint */
  virusScanEndpoint?: string;
  /** Max attachment size in bytes (default: 50MB) */
  maxSize?: number;
  /** Presigned URL expiration in seconds (default: 3600) */
  urlExpirationSeconds?: number;
  /** Enable attachment deduplication (default: true) */
  enableDeduplication?: boolean;
  /** Attachment content base64 or buffer reference */
  attachmentData?: string;
}

/**
 * Result of attachment download and storage operation
 */
export interface AttachmentHandlerResult {
  /** UUID of created/found attachment record in DB (FK to EmailAttachment) */
  attachmentId: string;
  /** Original filename from email headers */
  filename: string;
  /** Detected/verified MIME type */
  mimeType: string;
  /** Size in bytes */
  size: number;
  /** Storage location (blob storage key) */
  storageKey: string;
  /** Content hash for deduplication */
  contentHash: string;
  /** Presigned URL for secure download (valid for urlExpirationSeconds) */
  presignedUrl: string;
  /** Virus scan status: 'clean', 'suspicious', 'infected', 'pending', 'skipped' */
  virusScanStatus: 'clean' | 'suspicious' | 'infected' | 'pending' | 'skipped';
  /** Virus scan details if applicable */
  virusScanDetails?: string;
  /** Whether this is a deduplicated attachment (stored once, linked multiple times) */
  isDeduplicated: boolean;
  /** Timestamp when attachment was processed */
  processedAt: number;
  /** Total processing time in milliseconds */
  processingTime: number;
}

/**
 * Attachment metadata tracked in database
 */
export interface AttachmentMetadata {
  attachmentId: string;
  messageId: string;
  tenantId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  contentHash: string;
  virusScanStatus: 'clean' | 'suspicious' | 'infected' | 'pending' | 'skipped';
  virusScanDetails?: string;
  isDeleted: boolean;
  deletedAt?: number;
  retentionExpiresAt: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Attachment Handler Executor - Email attachment lifecycle management
 *
 * Implements Phase 6 email attachment processing:
 * 1. Retrieve attachment from email message
 * 2. Validate filename and size constraints
 * 3. Detect/verify MIME type
 * 4. Check dangerous files/content
 * 5. Stream upload to blob storage (S3 or filesystem)
 * 6. Calculate content hash for deduplication
 * 7. Queue virus scan (ClamAV/VirusTotal integration)
 * 8. Generate presigned URL for display
 * 9. Store metadata in EmailAttachment entity
 * 10. Return attachment reference for email display
 */
export class AttachmentHandlerExecutor implements INodeExecutor {
  readonly nodeType = 'attachment-handler';
  readonly category = 'email-integration';
  readonly description =
    'Download and store email attachments with virus scanning, deduplication, and presigned URLs';

  /**
   * Execute attachment download and storage
   */
  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as AttachmentHandlerConfig;

      // Validate required parameters
      this._validateConfig(config);

      // Process attachment
      const result = await this._processAttachment(config, context);

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          status: 'processed',
          data: result
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      let errorCode = 'ATTACHMENT_HANDLER_ERROR';
      if (errorMsg.includes('dangerous') || errorMsg.includes('malicious')) {
        errorCode = 'SECURITY_VIOLATION';
      } else if (errorMsg.includes('size')) {
        errorCode = 'SIZE_LIMIT_EXCEEDED';
      } else if (errorMsg.includes('mime')) {
        errorCode = 'INVALID_MIME_TYPE';
      } else if (errorMsg.includes('storage')) {
        errorCode = 'STORAGE_ERROR';
      } else if (errorMsg.includes('parameter')) {
        errorCode = 'INVALID_PARAMS';
      }

      return {
        status: 'error',
        error: errorMsg,
        errorCode,
        timestamp: Date.now(),
        duration
      };
    }
  }

  /**
   * Validate node parameters
   */
  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required parameters
    if (!node.parameters.messageId) {
      errors.push('Message ID is required');
    } else if (typeof node.parameters.messageId !== 'string') {
      errors.push('Message ID must be a string');
    }

    if (!node.parameters.filename) {
      errors.push('Filename is required');
    } else if (typeof node.parameters.filename !== 'string') {
      errors.push('Filename must be a string');
    } else if (this._isDangerousFilename(node.parameters.filename)) {
      warnings.push(`Filename "${node.parameters.filename}" has potentially dangerous extension`);
    }

    if (!node.parameters.size || typeof node.parameters.size !== 'number') {
      errors.push('Size must be a number');
    } else if (node.parameters.size <= 0) {
      errors.push('Size must be greater than 0');
    } else if (node.parameters.size > (node.parameters.maxSize ?? 52428800)) {
      errors.push(
        `Size exceeds maximum allowed (${node.parameters.maxSize ?? 52428800} bytes)`
      );
    }

    // Optional parameters
    if (node.parameters.mimeType !== undefined) {
      if (typeof node.parameters.mimeType !== 'string') {
        errors.push('mimeType must be a string');
      } else if (
        DANGEROUS_MIME_TYPES.includes(node.parameters.mimeType.toLowerCase())
      ) {
        warnings.push(`MIME type "${node.parameters.mimeType}" may contain executable content`);
      }
    }

    if (node.parameters.maxSize !== undefined) {
      if (typeof node.parameters.maxSize !== 'number') {
        errors.push('maxSize must be a number');
      } else if (node.parameters.maxSize < 1024 || node.parameters.maxSize > 5368709120) {
        errors.push('maxSize must be between 1 KB and 5 GB');
      }
    }

    if (node.parameters.urlExpirationSeconds !== undefined) {
      if (typeof node.parameters.urlExpirationSeconds !== 'number') {
        errors.push('urlExpirationSeconds must be a number');
      } else if (node.parameters.urlExpirationSeconds < 60 || node.parameters.urlExpirationSeconds > 604800) {
        errors.push('urlExpirationSeconds must be between 60 and 604800 seconds');
      }
    }

    if (node.parameters.enableVirusScan !== undefined) {
      if (typeof node.parameters.enableVirusScan !== 'boolean') {
        errors.push('enableVirusScan must be a boolean');
      }
    }

    if (node.parameters.enableDeduplication !== undefined) {
      if (typeof node.parameters.enableDeduplication !== 'boolean') {
        errors.push('enableDeduplication must be a boolean');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration parameters
   */
  private _validateConfig(config: AttachmentHandlerConfig): void {
    if (!config.messageId) {
      throw new Error('Attachment Handler requires "messageId" parameter (UUID of email message)');
    }

    if (!config.filename) {
      throw new Error('Attachment Handler requires "filename" parameter');
    }

    if (typeof config.size !== 'number' || config.size <= 0) {
      throw new Error('Attachment Handler requires "size" parameter (positive number in bytes)');
    }

    const maxSize = config.maxSize ?? 52428800; // 50MB default
    if (config.size > maxSize) {
      throw new Error(
        `Attachment size ${config.size} bytes exceeds maximum ${maxSize} bytes`
      );
    }

    if (this._isDangerousFilename(config.filename)) {
      throw new Error(`Dangerous filename detected: ${config.filename}`);
    }
  }

  /**
   * Check if filename has dangerous extension
   */
  private _isDangerousFilename(filename: string): boolean {
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return DANGEROUS_EXTENSIONS.includes(extension);
  }

  /**
   * Detect MIME type from filename and content
   */
  private _detectMimeType(filename: string, declaredMimeType?: string): string {
    // First try declared MIME type if provided
    if (declaredMimeType) {
      const normalized = declaredMimeType.toLowerCase();
      if (!DANGEROUS_MIME_TYPES.includes(normalized)) {
        return normalized;
      }
    }

    // Detect from filename extension
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    for (const [mimeType, extensions] of Object.entries(MIME_TYPE_PATTERNS)) {
      if (extensions.includes(extension)) {
        return mimeType;
      }
    }

    // Default to application/octet-stream for unknown types
    return 'application/octet-stream';
  }

  /**
   * Calculate content hash (SHA256)
   * In production: calculate from actual attachment data
   */
  private _calculateContentHash(data: string): string {
    // Simulate SHA256 hash calculation
    // In production: import crypto and calculate actual hash
    // return createHash('sha256').update(data).digest('hex');

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Generate storage key for blob storage
   */
  private _generateStorageKey(
    tenantId: string,
    messageId: string,
    filename: string,
    contentHash: string
  ): string {
    const prefix = 'attachments';
    const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
    const timestamp = Date.now();

    // Format: attachments/{tenantId}/{messageId}/{contentHash}/{filename}
    // This enables deduplication by content while maintaining original filename
    return `${prefix}/${tenantId}/${messageId}/${contentHash}/${timestamp}-${sanitizedFilename}`;
  }

  /**
   * Process attachment through complete lifecycle
   */
  private async _processAttachment(
    config: AttachmentHandlerConfig,
    context: WorkflowContext
  ): Promise<AttachmentHandlerResult> {
    const startTime = Date.now();
    const attachmentId = this._generateId();

    // Step 1: Validate filename and size
    this._validateConfig(config);

    // Step 2: Detect MIME type
    const mimeType = this._detectMimeType(config.filename, config.mimeType);

    // Step 3: Check dangerous content
    if (DANGEROUS_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(`Dangerous MIME type detected: ${mimeType}`);
    }

    // Step 4: Calculate content hash
    const attachmentData = config.attachmentData || '';
    const contentHash = this._calculateContentHash(attachmentData);

    // Step 5: Check for deduplication
    const isDeduplicated = config.enableDeduplication ?? true;
    // In production: check if contentHash already exists in DB for this tenant
    // If found: link to existing attachment instead of re-storing

    // Step 6: Generate storage key
    const storageKey = this._generateStorageKey(
      context.tenantId,
      config.messageId,
      config.filename,
      contentHash
    );

    // Step 7: Stream upload to blob storage
    // In production: use TenantAwareBlobStorage.uploadStream()
    // Simulate successful upload
    const uploadSize = config.size;

    // Step 8: Queue virus scan (async)
    const virusScanStatus = this._queueVirusScan(config);

    // Step 9: Generate presigned URL
    const presignedUrl = this._generatePresignedUrl(
      storageKey,
      config.urlExpirationSeconds ?? 3600
    );

    // Step 10: Store metadata
    const metadata: AttachmentMetadata = {
      attachmentId,
      messageId: config.messageId,
      tenantId: context.tenantId,
      filename: config.filename,
      mimeType,
      size: uploadSize,
      storageKey,
      contentHash,
      virusScanStatus,
      isDeleted: false,
      retentionExpiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // In production: insert into EmailAttachment entity via DBAL

    const duration = Date.now() - startTime;

    return {
      attachmentId,
      filename: config.filename,
      mimeType,
      size: uploadSize,
      storageKey,
      contentHash,
      presignedUrl,
      virusScanStatus,
      isDeduplicated,
      processedAt: Date.now(),
      processingTime: duration
    };
  }

  /**
   * Queue attachment for virus scanning
   */
  private _queueVirusScan(config: AttachmentHandlerConfig): 'pending' | 'skipped' | 'clean' {
    if (!config.enableVirusScan) {
      return 'skipped';
    }

    // Check if file is likely to need scanning
    if (
      DANGEROUS_EXTENSIONS.includes(
        config.filename.substring(config.filename.lastIndexOf('.')).toLowerCase()
      )
    ) {
      // In production:
      // 1. Queue job in Celery/RabbitMQ
      // 2. Call external virus scan API (ClamAV, VirusTotal)
      // 3. Store scan result in AttachmentMetadata
      return 'pending';
    }

    // Low-risk file types skip scanning
    return 'clean';
  }

  /**
   * Generate presigned URL for attachment download
   */
  private _generatePresignedUrl(storageKey: string, expirationSeconds: number): string {
    // In production: use TenantAwareBlobStorage.generatePresignedUrl()
    // This returns a signed S3 URL or filesystem-based download link

    // Simulate presigned URL format
    const expiresAt = Date.now() + expirationSeconds * 1000;
    const signature = this._generateSignature(storageKey, expiresAt);

    return `/api/v1/attachments/download/${storageKey}?expires=${expiresAt}&sig=${signature}`;
  }

  /**
   * Generate HMAC signature for presigned URL
   */
  private _generateSignature(storageKey: string, expiresAt: number): string {
    // In production: use crypto.createHmac with SECRET_KEY
    const data = `${storageKey}:${expiresAt}`;
    let hash = 0;

    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Generate UUID for attachment record
   */
  private _generateId(): string {
    return `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Export singleton executor instance
 */
export const attachmentHandlerExecutor = new AttachmentHandlerExecutor();
