/**
 * Email Parser Node Executor Plugin - Phase 6
 * RFC 5322 compliant email parsing with MIME multipart support
 *
 * Features:
 * - RFC 5322 email parsing (headers, body, attachments)
 * - MIME multipart message handling (multipart/alternative, multipart/mixed)
 * - HTML body sanitization (XSS protection via removal of dangerous tags)
 * - Attachment extraction and cataloging
 * - Structured EmailMessage format output matching DBAL schema
 * - Base64/quoted-printable decoding for content
 * - Comprehensive error handling with recovery options
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from './workflow';

/**
 * Parsed email message matching DBAL EmailMessage schema
 */
export interface ParsedEmailMessage {
  /** RFC 5322 Message-ID header */
  messageId: string;
  /** Sender email address */
  from: string;
  /** Recipient addresses (array) */
  to: string[];
  /** CC recipients (array) */
  cc?: string[];
  /** BCC recipients (array) */
  bcc?: string[];
  /** Reply-To header (optional) */
  replyTo?: string;
  /** Email subject */
  subject: string;
  /** Plain text body */
  textBody?: string;
  /** HTML body (sanitized) */
  htmlBody?: string;
  /** All headers as key-value pairs */
  headers: Record<string, string | string[]>;
  /** Message timestamp (ISO 8601) */
  receivedAt: string;
  /** Number of attachments */
  attachmentCount: number;
  /** Attachment metadata */
  attachments: EmailAttachmentMetadata[];
  /** Raw message size in bytes */
  size: number;
  /** Detected content priority (high/normal/low) */
  priority?: 'high' | 'normal' | 'low';
  /** MIME type of original message */
  mimeType: string;
}

/**
 * Attachment metadata for cataloging
 */
export interface EmailAttachmentMetadata {
  /** Original filename */
  filename: string;
  /** MIME type (e.g., image/png, application/pdf) */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Content-ID for embedded images (optional) */
  contentId?: string;
  /** Inline vs attachment */
  isInline: boolean;
  /** Base64 encoded content (for inline/small files) */
  content?: string;
  /** Encoding of content (base64, quoted-printable, 7bit, 8bit, binary) */
  contentEncoding: string;
}

/**
 * Email parser configuration
 */
export interface EmailParserConfig {
  /** Raw email message (RFC 5322 format) */
  rawMessage: string;
  /** Maximum attachment size (bytes, default: 25MB) */
  maxAttachmentSize?: number;
  /** Extract attachment content (true=base64, false=metadata only) */
  extractAttachmentContent?: boolean;
  /** Sanitize HTML body (remove script, iframe, etc.) */
  sanitizeHtml?: boolean;
  /** Maximum body text length (characters, default: 1MB) */
  maxBodyLength?: number;
  /** Tenant ID for multi-tenant context */
  tenantId: string;
}

/**
 * Parser result with metrics and errors
 */
export interface ParserResult {
  /** Successfully parsed message */
  message?: ParsedEmailMessage;
  /** Parse errors encountered */
  errors: ParserError[];
  /** Parse warnings (non-fatal issues) */
  warnings: string[];
  /** Parse metrics */
  metrics: {
    /** Total parsing time (ms) */
    parseDurationMs: number;
    /** Headers parsed count */
    headerCount: number;
    /** Body parts parsed count */
    partCount: number;
    /** Total attachments found */
    attachmentCount: number;
    /** Total attachment size (bytes) */
    attachmentSizeBytes: number;
    /** HTML sanitization warnings */
    sanitizationWarnings: number;
  };
}

/**
 * Parser error details
 */
export interface ParserError {
  /** Error code (INVALID_HEADERS, MISSING_FROM, INVALID_MIME, etc.) */
  code: string;
  /** Error message */
  message: string;
  /** Whether parsing can continue */
  recoverable: boolean;
  /** Part of message that caused error (if applicable) */
  context?: string;
}

/**
 * MIME part structure for multipart parsing
 */
interface MimePart {
  headers: Map<string, string | string[]>;
  body: string;
  boundary?: string;
  contentType: string;
  contentEncoding: string;
  isMultipart: boolean;
  parts: MimePart[];
}

/**
 * Email Parser Executor - RFC 5322 compliant parsing
 *
 * Implements RFC 5322 (Internet Message Format) with support for
 * MIME multipart messages (RFC 2045-2049) and comprehensive
 * attachment extraction with security filtering.
 */
export class EmailParserExecutor implements INodeExecutor {
  readonly nodeType = 'email-parser';
  readonly category = 'email-integration';
  readonly description = 'Parse RFC 5322 email messages with MIME multipart support and HTML sanitization';

  // Dangerous HTML tags that could contain XSS vectors
  private readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'applet',
    'meta', 'link', 'style', 'form', 'input', 'button',
    'textarea', 'select', 'label', 'fieldset', 'legend',
    'svg', 'math', 'video', 'audio', 'source', 'track'
  ];

  // Dangerous attributes that could contain event handlers
  private readonly DANGEROUS_ATTRS = [
    'onload', 'onerror', 'onmouseover', 'onclick', 'onchange',
    'onsubmit', 'onkeydown', 'onkeyup', 'onwheel', 'onscroll',
    'ondrag', 'ondrop', 'onpaste', 'oncopy', 'oncut', 'onwheel',
    'oncontextmenu', 'ondblclick', 'onfocus', 'onblur',
    'href', 'src', 'action', 'formaction', 'data', 'poster'
  ];

  /**
   * Execute email parsing
   */
  async execute(
    node: WorkflowNode,
    _context: WorkflowContext,
    _state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const config = node.parameters as EmailParserConfig;

      // Validate required parameters
      this._validateConfig(config);

      // Parse email
      const result = this._parseEmail(config);

      const duration = Date.now() - startTime;

      if (result.errors.length > 0 && result.message === undefined) {
        // Critical parse errors - no message produced
        return {
          status: 'error',
          error: `Failed to parse email: ${result.errors[0].message}`,
          errorCode: 'PARSE_ERROR',
          output: {
            errors: result.errors,
            warnings: result.warnings,
            metrics: result.metrics
          },
          timestamp: Date.now(),
          duration
        };
      }

      // Partial parse - message extracted with warnings/errors
      return {
        status: result.errors.length === 0 ? 'success' : 'partial',
        output: {
          message: result.message,
          errors: result.errors,
          warnings: result.warnings,
          metrics: result.metrics
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        status: 'error',
        error: errorMsg,
        errorCode: 'EMAIL_PARSER_ERROR',
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
    if (!node.parameters.rawMessage) {
      errors.push('Raw email message is required');
    } else if (typeof node.parameters.rawMessage !== 'string') {
      errors.push('Raw email message must be a string');
    } else if (node.parameters.rawMessage.length === 0) {
      errors.push('Raw email message cannot be empty');
    }

    if (!node.parameters.tenantId) {
      errors.push('Tenant ID is required');
    } else if (typeof node.parameters.tenantId !== 'string') {
      errors.push('Tenant ID must be a string');
    }

    // Optional parameters
    if (node.parameters.maxAttachmentSize !== undefined) {
      if (typeof node.parameters.maxAttachmentSize !== 'number') {
        errors.push('maxAttachmentSize must be a number');
      } else if (node.parameters.maxAttachmentSize < 0) {
        errors.push('maxAttachmentSize must be positive');
      }
    }

    if (node.parameters.maxBodyLength !== undefined) {
      if (typeof node.parameters.maxBodyLength !== 'number') {
        errors.push('maxBodyLength must be a number');
      } else if (node.parameters.maxBodyLength < 0) {
        errors.push('maxBodyLength must be positive');
      }
    }

    if (node.parameters.sanitizeHtml !== undefined) {
      if (typeof node.parameters.sanitizeHtml !== 'boolean') {
        errors.push('sanitizeHtml must be a boolean');
      }
    }

    if (node.parameters.extractAttachmentContent !== undefined) {
      if (typeof node.parameters.extractAttachmentContent !== 'boolean') {
        errors.push('extractAttachmentContent must be a boolean');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration
   */
  private _validateConfig(config: EmailParserConfig): void {
    if (!config.rawMessage) {
      throw new Error('Email parser requires "rawMessage" parameter');
    }

    if (!config.tenantId) {
      throw new Error('Email parser requires "tenantId" parameter');
    }

    if (typeof config.rawMessage !== 'string') {
      throw new Error('rawMessage must be a string');
    }

    if (typeof config.tenantId !== 'string') {
      throw new Error('tenantId must be a string');
    }
  }

  /**
   * Main email parsing function
   */
  private _parseEmail(config: EmailParserConfig): ParserResult {
    const startTime = Date.now();
    const errors: ParserError[] = [];
    const warnings: string[] = [];
    const metrics = {
      parseDurationMs: 0,
      headerCount: 0,
      partCount: 0,
      attachmentCount: 0,
      attachmentSizeBytes: 0,
      sanitizationWarnings: 0
    };

    try {
      // Split headers and body
      const [headersSection, bodySection] = this._splitHeadersAndBody(config.rawMessage);

      // Parse headers (RFC 5322)
      const parsedHeaders = this._parseHeaders(headersSection);
      metrics.headerCount = parsedHeaders.size;

      // Extract required header fields
      const from = this._getHeader(parsedHeaders, 'from');
      if (!from) {
        errors.push({
          code: 'MISSING_FROM',
          message: 'Email does not contain "From" header',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      const to = this._parseEmailAddresses(this._getHeader(parsedHeaders, 'to') || '');
      if (to.length === 0) {
        errors.push({
          code: 'MISSING_TO',
          message: 'Email does not contain valid "To" header',
          recoverable: false
        });
        return { errors, warnings, metrics };
      }

      const subject = this._decodeHeaderValue(this._getHeader(parsedHeaders, 'subject') || '') || '';
      const messageId = this._getHeader(parsedHeaders, 'message-id') || this._generateMessageId();

      // Parse MIME structure
      const contentType = this._getHeader(parsedHeaders, 'content-type') || 'text/plain';
      const mimePart = this._parseMimePart(
        bodySection,
        contentType,
        this._getHeader(parsedHeaders, 'content-transfer-encoding') || '7bit'
      );
      metrics.partCount = this._countMimeParts(mimePart);

      // Extract body parts
      const { textBody, htmlBody, sanitizationWarnings } = this._extractBodies(
        mimePart,
        config.sanitizeHtml ?? true,
        config.maxBodyLength ?? 1024 * 1024
      );
      metrics.sanitizationWarnings = sanitizationWarnings;

      // Extract attachments
      const { attachments, attachmentCount, attachmentSizeBytes } = this._extractAttachments(
        mimePart,
        config.extractAttachmentContent ?? false,
        config.maxAttachmentSize ?? 25 * 1024 * 1024
      );
      metrics.attachmentCount = attachmentCount;
      metrics.attachmentSizeBytes = attachmentSizeBytes;

      // Extract optional headers
      const cc = this._parseEmailAddresses(this._getHeader(parsedHeaders, 'cc') || '');
      const bcc = this._parseEmailAddresses(this._getHeader(parsedHeaders, 'bcc') || '');
      const replyTo = this._getHeader(parsedHeaders, 'reply-to');
      const priority = this._parsePriority(this._getHeader(parsedHeaders, 'x-priority'));

      // Parse received date
      const dateStr = this._getHeader(parsedHeaders, 'date') || new Date().toISOString();
      const receivedAt = this._parseEmailDate(dateStr);

      // Build result message
      const message: ParsedEmailMessage = {
        messageId,
        from,
        to,
        cc: cc.length > 0 ? cc : undefined,
        bcc: bcc.length > 0 ? bcc : undefined,
        replyTo,
        subject,
        textBody,
        htmlBody,
        headers: this._headersToObject(parsedHeaders),
        receivedAt,
        attachmentCount,
        attachments,
        size: config.rawMessage.length,
        priority,
        mimeType: contentType
      };

      metrics.parseDurationMs = Date.now() - startTime;

      return {
        message,
        errors,
        warnings,
        metrics
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({
        code: 'PARSE_EXCEPTION',
        message: errorMsg,
        recoverable: false
      });

      metrics.parseDurationMs = Date.now() - startTime;
      return { errors, warnings, metrics };
    }
  }

  /**
   * Split RFC 5322 message into headers and body
   * Headers end with first blank line (CRLF CRLF or LF LF)
   */
  private _splitHeadersAndBody(rawMessage: string): [string, string] {
    const crlfCrlfIndex = rawMessage.indexOf('\r\n\r\n');
    const lfLfIndex = rawMessage.indexOf('\n\n');

    let splitIndex = -1;
    let headerLength = 0;

    if (crlfCrlfIndex !== -1 && lfLfIndex !== -1) {
      // Both found, use whichever comes first
      if (crlfCrlfIndex < lfLfIndex) {
        splitIndex = crlfCrlfIndex;
        headerLength = 4;
      } else {
        splitIndex = lfLfIndex;
        headerLength = 2;
      }
    } else if (crlfCrlfIndex !== -1) {
      splitIndex = crlfCrlfIndex;
      headerLength = 4;
    } else if (lfLfIndex !== -1) {
      splitIndex = lfLfIndex;
      headerLength = 2;
    } else {
      // No separator found, treat entire message as headers
      return [rawMessage, ''];
    }

    const headers = rawMessage.substring(0, splitIndex);
    const body = rawMessage.substring(splitIndex + headerLength);

    return [headers, body];
  }

  /**
   * Parse RFC 5322 headers into a map
   * Handles header folding (continuation lines starting with space/tab)
   */
  private _parseHeaders(headersSection: string): Map<string, string | string[]> {
    const headers = new Map<string, string | string[]>();
    const lines = headersSection.split(/\r\n|\n/);
    let currentHeader = '';
    let currentValue = '';

    for (const line of lines) {
      // Check for header folding (continuation line)
      if (line.match(/^[\s\t]/)) {
        // Continuation of previous header
        currentValue += ' ' + line.trim();
      } else if (line.includes(':')) {
        // Save previous header
        if (currentHeader) {
          const existing = headers.get(currentHeader.toLowerCase());
          if (existing) {
            if (Array.isArray(existing)) {
              existing.push(currentValue);
            } else {
              headers.set(currentHeader.toLowerCase(), [existing, currentValue]);
            }
          } else {
            headers.set(currentHeader.toLowerCase(), currentValue);
          }
        }

        // Parse new header
        const [name, ...valueParts] = line.split(':');
        currentHeader = name.trim();
        currentValue = valueParts.join(':').trim();
      }
    }

    // Save last header
    if (currentHeader) {
      const existing = headers.get(currentHeader.toLowerCase());
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(currentValue);
        } else {
          headers.set(currentHeader.toLowerCase(), [existing, currentValue]);
        }
      } else {
        headers.set(currentHeader.toLowerCase(), currentValue);
      }
    }

    return headers;
  }

  /**
   * Get header value (case-insensitive), handling arrays
   */
  private _getHeader(headers: Map<string, string | string[]>, name: string): string | undefined {
    const value = headers.get(name.toLowerCase());
    if (Array.isArray(value)) {
      return value[0]; // Return first value if multiple
    }
    return value;
  }

  /**
   * Convert headers map to plain object
   */
  private _headersToObject(headers: Map<string, string | string[]>): Record<string, string | string[]> {
    const obj: Record<string, string | string[]> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Decode RFC 2047 encoded header values
   */
  private _decodeHeaderValue(value: string): string {
    // RFC 2047: =?charset?encoding?encoded-text?=
    const encodedPattern = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g;

    return value.replace(encodedPattern, (match, charset, encoding, text) => {
      try {
        if (encoding.toUpperCase() === 'B') {
          // Base64 decoding
          return Buffer.from(text, 'base64').toString(charset);
        } else if (encoding.toUpperCase() === 'Q') {
          // Quoted-printable decoding
          const decoded = text.replace(/=([0-9A-F]{2})/gi, (_: string, hex: string) => {
            return String.fromCharCode(parseInt(hex, 16));
          });
          return Buffer.from(decoded, 'binary').toString(charset);
        }
      } catch (e) {
        // If decoding fails, return original
      }
      return match;
    });
  }

  /**
   * Parse email addresses from header value
   * Handles: "Name <email@example.com>", "email@example.com", etc.
   */
  private _parseEmailAddresses(headerValue: string): string[] {
    if (!headerValue) return [];

    const addresses: string[] = [];
    // Split by comma, but respect angle brackets
    const parts = headerValue.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      // Extract email from angle brackets if present
      const match = trimmed.match(/<([^>]+)>/);
      if (match) {
        addresses.push(match[1]);
      } else if (trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        // Direct email address
        addresses.push(trimmed);
      }
    }

    return addresses;
  }

  /**
   * Parse MIME message structure
   */
  private _parseMimePart(
    body: string,
    contentType: string,
    contentEncoding: string,
    boundary?: string
  ): MimePart {
    const isMultipart = contentType.includes('multipart');
    const boundaryMatch = contentType.match(/boundary\s*=\s*"?([^";,\s]+)"?/i);
    const detectedBoundary = boundaryMatch ? boundaryMatch[1] : boundary;

    const mimePart: MimePart = {
      headers: new Map(),
      body,
      contentType,
      contentEncoding,
      isMultipart,
      boundary: detectedBoundary,
      parts: []
    };

    if (isMultipart && detectedBoundary) {
      mimePart.parts = this._parseMultipartBody(body, detectedBoundary);
    }

    return mimePart;
  }

  /**
   * Parse multipart body into separate parts
   */
  private _parseMultipartBody(body: string, boundary: string): MimePart[] {
    const parts: MimePart[] = [];
    const boundaryDelimiter = `--${boundary}`;
    const boundaryEnd = `--${boundary}--`;

    let currentPartCount = 0;
    let partIndex = body.indexOf(boundaryDelimiter);

    const maxParts = 1000;
    while (partIndex !== -1 && currentPartCount < maxParts) {
      if (body.substring(partIndex, partIndex + boundaryEnd.length) === boundaryEnd) {
        break;
      }

      partIndex += boundaryDelimiter.length;

      // Skip CRLF after boundary
      if (body[partIndex] === '\r' && body[partIndex + 1] === '\n') {
        partIndex += 2;
      } else if (body[partIndex] === '\n') {
        partIndex += 1;
      }

      // Find next boundary
      let nextBoundaryIndex = body.indexOf(boundaryDelimiter, partIndex);
      if (nextBoundaryIndex === -1) {
        nextBoundaryIndex = body.length;
      }

      // Extract part
      const partContent = body.substring(partIndex, nextBoundaryIndex);
      const [partHeaders, partBody] = this._splitHeadersAndBody(partContent);

      // Parse part headers
      const headers = this._parseHeaders(partHeaders);
      const contentType = this._getHeader(headers, 'content-type') || 'text/plain';
      const contentEncoding = this._getHeader(headers, 'content-transfer-encoding') || '7bit';

      const part = this._parseMimePart(partBody, contentType, contentEncoding);
      part.headers = headers;

      parts.push(part);
      currentPartCount++;

      partIndex = nextBoundaryIndex;
    }

    return parts;
  }

  /**
   * Extract text and HTML bodies from MIME structure
   */
  private _extractBodies(
    mimePart: MimePart,
    sanitizeHtml: boolean,
    maxLength: number
  ): { textBody?: string; htmlBody?: string; sanitizationWarnings: number } {
    let textBody: string | undefined;
    let htmlBody: string | undefined;
    let sanitizationWarnings = 0;

    if (!mimePart.isMultipart) {
      // Single-part message
      const decoded = this._decodeContent(mimePart.body, mimePart.contentEncoding);

      if (mimePart.contentType.includes('text/html')) {
        htmlBody = this._limitLength(decoded, maxLength);
        if (sanitizeHtml) {
          const result = this._sanitizeHtml(htmlBody);
          htmlBody = result.html;
          sanitizationWarnings = result.warnings;
        }
      } else if (mimePart.contentType.includes('text/plain')) {
        textBody = this._limitLength(decoded, maxLength);
      }
    } else {
      // Multipart message - look for text/plain and text/html
      for (const part of mimePart.parts) {
        if (part.contentType.includes('multipart/alternative')) {
          // Alternative parts - prefer HTML
          for (const altPart of part.parts) {
            const decoded = this._decodeContent(altPart.body, altPart.contentEncoding);
            if (altPart.contentType.includes('text/html')) {
              htmlBody = this._limitLength(decoded, maxLength);
              if (sanitizeHtml) {
                const result = this._sanitizeHtml(htmlBody);
                htmlBody = result.html;
                sanitizationWarnings += result.warnings;
              }
            } else if (altPart.contentType.includes('text/plain') && !textBody) {
              textBody = this._limitLength(decoded, maxLength);
            }
          }
        } else if (part.contentType.includes('text/plain') && !textBody && !htmlBody) {
          const decoded = this._decodeContent(part.body, part.contentEncoding);
          textBody = this._limitLength(decoded, maxLength);
        } else if (part.contentType.includes('text/html') && !htmlBody) {
          const decoded = this._decodeContent(part.body, part.contentEncoding);
          htmlBody = this._limitLength(decoded, maxLength);
          if (sanitizeHtml) {
            const result = this._sanitizeHtml(htmlBody);
            htmlBody = result.html;
            sanitizationWarnings += result.warnings;
          }
        }
      }
    }

    return { textBody, htmlBody, sanitizationWarnings };
  }

  /**
   * Extract attachments from MIME structure
   */
  private _extractAttachments(
    mimePart: MimePart,
    extractContent: boolean,
    maxSize: number
  ): { attachments: EmailAttachmentMetadata[]; attachmentCount: number; attachmentSizeBytes: number } {
    const attachments: EmailAttachmentMetadata[] = [];
    let attachmentCount = 0;
    let attachmentSizeBytes = 0;

    const extractFromParts = (parts: MimePart[]) => {
      for (const part of parts) {
        if (part.isMultipart) {
          extractFromParts(part.parts);
        } else {
          const disposition = this._getHeader(part.headers, 'content-disposition') || '';
          const filename = this._extractFilename(
            this._getHeader(part.headers, 'content-disposition') || '',
            this._getHeader(part.headers, 'content-type') || ''
          );

          if (filename && !part.contentType.includes('text/plain') && !part.contentType.includes('text/html')) {
            const isInline = disposition.includes('inline');
            const contentId = this._getHeader(part.headers, 'content-id');
            const contentSize = part.body.length;

            if (contentSize <= maxSize) {
              attachmentCount++;
              attachmentSizeBytes += contentSize;

              const attachment: EmailAttachmentMetadata = {
                filename,
                mimeType: this._getMimeType(part.contentType),
                size: contentSize,
                contentId: contentId?.replace(/[<>]/g, ''),
                isInline,
                contentEncoding: part.contentEncoding
              };

              if (extractContent && contentSize < 10 * 1024 * 1024) {
                attachment.content = this._decodeContent(part.body, part.contentEncoding);
              }

              attachments.push(attachment);
            }
          }
        }
      }
    };

    if (mimePart.isMultipart) {
      extractFromParts(mimePart.parts);
    }

    return { attachments, attachmentCount, attachmentSizeBytes };
  }

  /**
   * Decode content based on encoding type
   */
  private _decodeContent(content: string, encoding: string): string {
    const normalized = encoding.toLowerCase().replace(/[_-]/g, '');

    try {
      switch (normalized) {
        case 'base64':
          return Buffer.from(content, 'base64').toString('utf-8');
        case 'quotedprintable':
        case 'quotedprint':
          return this._decodeQuotedPrintable(content);
        case '7bit':
        case '8bit':
        case 'binary':
        default:
          return content;
      }
    } catch (e) {
      // If decoding fails, return original content
      return content;
    }
  }

  /**
   * Decode quoted-printable content
   */
  private _decodeQuotedPrintable(content: string): string {
    return content
      .replace(/=\r?\n/g, '') // Remove soft line breaks
      .replace(/=([0-9A-F]{2})/gi, (_match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  private _sanitizeHtml(html: string): { html: string; warnings: number } {
    let warnings = 0;
    let sanitized = html;

    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, () => {
      warnings++;
      return '';
    });

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, () => {
      warnings++;
      return '';
    });

    // Remove style tags and content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, () => {
      warnings++;
      return '';
    });

    // Remove event handlers from tags
    const tagPattern = /<(\w+)[^>]*>/gi;
    sanitized = sanitized.replace(tagPattern, (match, tagName) => {
      let result = match;

      // Check if tag is dangerous
      if (this.DANGEROUS_TAGS.includes(tagName.toLowerCase())) {
        warnings++;
        return '';
      }

      // Remove dangerous attributes
      for (const attr of this.DANGEROUS_ATTRS) {
        const pattern = new RegExp(`\\s${attr}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*)`, 'gi');
        if (pattern.test(result)) {
          warnings++;
          result = result.replace(pattern, '');
        }
      }

      return result;
    });

    // Remove closing tags for removed elements
    for (const tag of this.DANGEROUS_TAGS) {
      const pattern = new RegExp(`</${tag}>`, 'gi');
      sanitized = sanitized.replace(pattern, '');
    }

    return { html: sanitized, warnings };
  }

  /**
   * Extract filename from Content-Disposition or Content-Type header
   */
  private _extractFilename(disposition: string, contentType: string): string | undefined {
    // Try Content-Disposition first
    let match = disposition.match(/filename\s*=\s*"?([^";,\s]+)"?/i);
    if (match) {
      return this._decodeHeaderValue(match[1]);
    }

    // Try Content-Type name parameter
    match = contentType.match(/name\s*=\s*"?([^";,\s]+)"?/i);
    if (match) {
      return this._decodeHeaderValue(match[1]);
    }

    return undefined;
  }

  /**
   * Extract MIME type from Content-Type header
   */
  private _getMimeType(contentType: string): string {
    const match = contentType.match(/^([^;]+)/);
    return match ? match[1].trim() : 'application/octet-stream';
  }

  /**
   * Limit text to maximum length
   */
  private _limitLength(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  }

  /**
   * Parse priority from X-Priority header
   */
  private _parsePriority(priorityHeader?: string): 'high' | 'normal' | 'low' | undefined {
    if (!priorityHeader) return undefined;

    const value = parseInt(priorityHeader, 10);
    if (value <= 2) return 'high';
    if (value >= 4) return 'low';
    return 'normal';
  }

  /**
   * Parse email date header to ISO 8601
   */
  private _parseEmailDate(dateStr: string): string {
    try {
      // RFC 5322 format: "Mon, 23 Jan 2026 14:30:45 +0000" or similar
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      // Fall through to default
    }

    // If parsing fails, return current time
    return new Date().toISOString();
  }

  /**
   * Generate Message-ID if not present
   */
  private _generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `<${timestamp}.${random}@metabuilder.local>`;
  }

  /**
   * Count total MIME parts recursively
   */
  private _countMimeParts(mimePart: MimePart): number {
    let count = 1;
    if (mimePart.isMultipart) {
      for (const part of mimePart.parts) {
        count += this._countMimeParts(part);
      }
    }
    return count;
  }
}

/**
 * Export singleton executor instance
 */
export const emailParserExecutor = new EmailParserExecutor();
