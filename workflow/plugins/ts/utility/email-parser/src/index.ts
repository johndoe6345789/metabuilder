/**
 * Email Parser Node Executor Plugin
 * Parses RFC 5322 format email messages
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';

export interface EmailHeaders {
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  date?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  contentType?: string;
  contentTransferEncoding?: string;
  [key: string]: any;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  contentId?: string;
  isInline: boolean;
  data?: Buffer;
}

export interface ParsedEmail {
  headers: EmailHeaders;
  body: string;
  textBody?: string;
  htmlBody?: string;
  attachments: EmailAttachment[];
  parseTime: number;
}

export class EmailParserExecutor implements INodeExecutor {
  nodeType = 'email-parser';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const startTime = Date.now();

    try {
      const { message, includeAttachments = true } = node.parameters as {
        message: string;
        includeAttachments?: boolean;
      };

      if (!message) {
        throw new Error('Email Parser requires "message" parameter (RFC 5322 format)');
      }

      if (typeof message !== 'string') {
        throw new Error('Message must be a string in RFC 5322 format');
      }

      // Parse the email message
      const parsed = this._parseRFC5322Message(message, includeAttachments);

      const duration = Date.now() - startTime;

      return {
        status: 'success',
        output: {
          status: 'parsed',
          data: parsed
        },
        timestamp: Date.now(),
        duration
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'EMAIL_PARSE_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node.parameters.message) {
      errors.push('Message is required');
    }

    if (node.parameters.message && typeof node.parameters.message !== 'string') {
      errors.push('Message must be a string');
    }

    // Check for minimum RFC 5322 structure
    if (node.parameters.message && typeof node.parameters.message === 'string') {
      const hasHeaders = node.parameters.message.includes(':');
      if (!hasHeaders) {
        warnings.push('Message does not appear to contain RFC 5322 headers');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private _parseRFC5322Message(message: string, includeAttachments: boolean): ParsedEmail {
    // Split headers from body
    const [headersSection, ...bodyLines] = message.split('\n\n');
    const bodySection = bodyLines.join('\n\n');

    // Parse headers
    const headers = this._parseHeaders(headersSection);

    // Split body into text and html parts
    const { textBody, htmlBody, attachments } = this._parseBody(
      bodySection,
      headers.contentType || '',
      includeAttachments
    );

    return {
      headers,
      body: bodySection,
      textBody,
      htmlBody,
      attachments: includeAttachments ? attachments : [],
      parseTime: Date.now()
    };
  }

  private _parseHeaders(headersSection: string): EmailHeaders {
    const headers: EmailHeaders = {};

    const lines = headersSection.split('\n');
    let currentHeader = '';

    for (const line of lines) {
      // Handle header line continuation
      if (line.startsWith(' ') || line.startsWith('\t')) {
        if (currentHeader) {
          headers[currentHeader] = (headers[currentHeader] || '') + ' ' + line.trim();
        }
        continue;
      }

      // Parse header key-value pair
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();

        // Handle multi-value headers
        switch (key) {
          case 'from':
            headers.from = this._extractEmail(value);
            break;
          case 'to':
            headers.to = this._extractEmails(value);
            break;
          case 'cc':
            headers.cc = this._extractEmails(value);
            break;
          case 'bcc':
            headers.bcc = this._extractEmails(value);
            break;
          case 'subject':
            headers.subject = this._decodeHeader(value);
            break;
          case 'date':
            headers.date = value;
            break;
          case 'message-id':
            headers.messageId = value;
            break;
          case 'in-reply-to':
            headers.inReplyTo = value;
            break;
          case 'references':
            headers.references = value.split(/\s+/).filter(Boolean);
            break;
          case 'content-type':
            headers.contentType = value;
            break;
          case 'content-transfer-encoding':
            headers.contentTransferEncoding = value;
            break;
          default:
            headers[key] = value;
        }

        currentHeader = key;
      }
    }

    return headers;
  }

  private _parseBody(
    bodySection: string,
    contentType: string,
    includeAttachments: boolean
  ): {
    textBody?: string;
    htmlBody?: string;
    attachments: EmailAttachment[];
  } {
    const attachments: EmailAttachment[] = [];

    // Detect multipart content
    if (contentType.includes('multipart/mixed') || contentType.includes('multipart/alternative')) {
      const boundary = this._extractBoundary(contentType);
      if (boundary) {
        return this._parseMultipart(bodySection, boundary, includeAttachments);
      }
    }

    // Single-part message
    if (contentType.includes('text/html')) {
      return { htmlBody: bodySection, attachments };
    } else if (contentType.includes('text/plain')) {
      return { textBody: bodySection, attachments };
    } else {
      return { textBody: bodySection, attachments };
    }
  }

  private _parseMultipart(
    body: string,
    boundary: string,
    includeAttachments: boolean
  ): {
    textBody?: string;
    htmlBody?: string;
    attachments: EmailAttachment[];
  } {
    const parts = body.split(`--${boundary}`);
    const attachments: EmailAttachment[] = [];
    let textBody: string | undefined;
    let htmlBody: string | undefined;

    for (const part of parts) {
      if (!part || part.startsWith('--')) continue;

      // Split part headers from content
      const [partHeaders, ...contentLines] = part.split('\n\n');
      const content = contentLines.join('\n\n').trim();

      // Parse part headers
      const contentTypeMatch = partHeaders.match(/content-type:\s*([^;\n]+)/i);
      const contentDispositionMatch = partHeaders.match(/content-disposition:\s*(\w+)/i);
      const filenameMatch = partHeaders.match(/filename="?([^";\n]+)"?/i);

      if (contentTypeMatch) {
        const partContentType = contentTypeMatch[1].trim();

        if (contentDispositionMatch?.[1] === 'attachment' && includeAttachments) {
          // Parse attachment
          attachments.push({
            filename: filenameMatch?.[1] || 'unknown',
            mimeType: partContentType,
            size: content.length,
            isInline: false
          });
        } else if (partContentType.includes('text/html')) {
          htmlBody = content;
        } else if (partContentType.includes('text/plain')) {
          textBody = content;
        }
      }
    }

    return { textBody, htmlBody, attachments };
  }

  private _extractBoundary(contentType: string): string | null {
    const match = contentType.match(/boundary="?([^";\n]+)"?/i);
    return match ? match[1] : null;
  }

  private _extractEmail(value: string): string {
    // Extract email address from "Name <email@domain.com>" format
    const match = value.match(/<(.+?)>/);
    return match ? match[1] : value.trim();
  }

  private _extractEmails(value: string): string[] {
    // Extract multiple email addresses
    return value
      .split(',')
      .map(email => this._extractEmail(email))
      .filter(Boolean);
  }

  private _decodeHeader(value: string): string {
    // Decode MIME-encoded headers (simplified)
    // Format: =?charset?encoding?encoded-data?=
    const match = value.match(/=\?([^?]+)\?([^?]+)\?([^?]+)\?=/);
    if (match) {
      const [, charset, encoding, data] = match;
      if (encoding === 'B') {
        // Base64 decoding (Node.js Buffer)
        return Buffer.from(data, 'base64').toString(charset || 'utf-8');
      } else if (encoding === 'Q') {
        // Quoted-printable (simplified)
        return data.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
      }
    }
    return value;
  }
}

export const emailParserExecutor = new EmailParserExecutor();
