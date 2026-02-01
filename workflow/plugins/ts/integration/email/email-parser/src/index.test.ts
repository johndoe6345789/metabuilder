/**
 * Email Parser Plugin - Comprehensive Test Suite
 *
 * Tests cover:
 * - RFC 5322 header parsing (folding, multiple values)
 * - MIME multipart message handling
 * - HTML sanitization (XSS protection)
 * - Attachment extraction and cataloging
 * - Content encoding (base64, quoted-printable)
 * - Header decoding (RFC 2047)
 * - Error handling and recovery
 */

import {
  emailParserExecutor,
  EmailParserConfig,
  ParsedEmailMessage,
  EmailAttachmentMetadata,
  ParserResult
} from './index';
import type { WorkflowNode } from './workflow';

describe('EmailParserExecutor', () => {
  const tenantId = 'test-tenant-123';

  describe('Basic RFC 5322 Parsing', () => {
    it('should parse simple plain text email', () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Test Email
Message-ID: <123@example.com>
Date: Mon, 23 Jan 2026 14:30:45 +0000

Hello, this is a test email.`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result = emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result).toBeDefined();
    });

    it('should extract required headers: From, To, Subject', async () => {
      const rawMessage = `From: alice@company.com
To: bob@company.com
Subject: Meeting Tomorrow
Message-ID: <msg-123@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Meeting at 2 PM.`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.status).toBe('success');
      expect(result.output.message.from).toBe('alice@company.com');
      expect(result.output.message.to).toContain('bob@company.com');
      expect(result.output.message.subject).toBe('Meeting Tomorrow');
    });

    it('should parse multiple To addresses', async () => {
      const rawMessage = `From: sender@example.com
To: alice@example.com, bob@example.com, charlie@example.com
Subject: Group Email
Message-ID: <msg-456@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Hello everyone.`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.to).toHaveLength(3);
      expect(result.output.message.to).toContain('alice@example.com');
      expect(result.output.message.to).toContain('bob@example.com');
      expect(result.output.message.to).toContain('charlie@example.com');
    });

    it('should parse email with display names in addresses', async () => {
      const rawMessage = `From: "Alice Smith" <alice@example.com>
To: "Bob Jones" <bob@example.com>, charlie@example.com
Subject: Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Test`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.from).toBe('alice@example.com');
      expect(result.output.message.to).toContain('bob@example.com');
      expect(result.output.message.to).toContain('charlie@example.com');
    });
  });

  describe('Header Folding and Continuation Lines', () => {
    it('should handle header folding with CRLF', async () => {
      const rawMessage = `From: sender@example.com\r
To: recipient@example.com\r
Subject: This is a very long subject that spans\r
 multiple lines and contains\r
 continuation text\r
Message-ID: <msg@example.com>\r
Date: Mon, 23 Jan 2026 10:00:00 +0000\r
\r
Body`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.subject).toContain('This is a very long subject');
      expect(result.output.message.subject).toContain('continuation text');
    });

    it('should handle optional headers: CC, BCC, Reply-To', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
CC: cc1@example.com, cc2@example.com
BCC: bcc@example.com
Reply-To: reply@example.com
Subject: Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Body`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.cc).toContain('cc1@example.com');
      expect(result.output.message.cc).toContain('cc2@example.com');
      expect(result.output.message.bcc).toContain('bcc@example.com');
      expect(result.output.message.replyTo).toBe('reply@example.com');
    });
  });

  describe('MIME Multipart Message Handling', () => {
    it('should parse multipart/alternative with text and HTML', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Multipart Email
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain
Content-Transfer-Encoding: 7bit

This is the plain text version.

--boundary123
Content-Type: text/html
Content-Transfer-Encoding: 7bit

<html><body>This is the HTML version.</body></html>

--boundary123--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: false
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.textBody).toContain('plain text version');
      expect(result.output.message.htmlBody).toContain('HTML version');
    });

    it('should extract attachments from multipart/mixed', async () => {
      const base64Content = Buffer.from('test file content').toString('base64');

      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Email with Attachment
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/mixed; boundary="boundary456"

--boundary456
Content-Type: text/plain
Content-Transfer-Encoding: 7bit

See attached file.

--boundary456
Content-Type: application/octet-stream
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="test.txt"

${base64Content}

--boundary456--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.attachmentCount).toBe(1);
      expect(result.output.message.attachments).toHaveLength(1);
      expect(result.output.message.attachments[0].filename).toBe('test.txt');
      expect(result.output.message.attachments[0].mimeType).toBe('application/octet-stream');
    });

    it('should handle inline attachments with Content-ID', async () => {
      const base64Img = Buffer.from('fake image data').toString('base64');

      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Email with Inline Image
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/mixed; boundary="boundary789"

--boundary789
Content-Type: text/html
Content-Transfer-Encoding: 7bit

<html><img src="cid:logo@company.com"/></html>

--boundary789
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Disposition: inline; filename="logo.png"
Content-ID: <logo@company.com>

${base64Img}

--boundary789--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.attachmentCount).toBe(1);
      expect(result.output.message.attachments[0].isInline).toBe(true);
      expect(result.output.message.attachments[0].contentId).toBe('logo@company.com');
    });
  });

  describe('Content Encoding Handling', () => {
    it('should decode base64 content', async () => {
      const plainText = 'This is the decoded content.';
      const base64Text = Buffer.from(plainText).toString('base64');

      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Base64 Email
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Transfer-Encoding: base64

${base64Text}`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.textBody).toBe(plainText);
    });

    it('should decode quoted-printable content', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Quoted Printable Email
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Transfer-Encoding: quoted-printable

This is a line with an equals sign =3D and special chars =C3=A9.`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.textBody).toContain('equals sign');
    });
  });

  describe('HTML Sanitization (XSS Protection)', () => {
    it('should remove script tags', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: XSS Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: text/html

<html><body>
<script>alert('XSS')</script>
<p>Safe content</p>
</body></html>`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: true
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.htmlBody).not.toContain('script');
      expect(result.output.message.htmlBody).toContain('Safe content');
      expect(result.output.metrics.sanitizationWarnings).toBeGreaterThan(0);
    });

    it('should remove event handlers from tags', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Event Handler Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: text/html

<html><body>
<img src="image.png" onerror="alert('XSS')"/>
<a href="javascript:void(0)" onclick="alert('click')">Click me</a>
<p>Safe text</p>
</body></html>`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: true
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.htmlBody).not.toContain('onerror');
      expect(result.output.message.htmlBody).not.toContain('onclick');
      expect(result.output.message.htmlBody).not.toContain('javascript');
    });

    it('should remove iframe tags', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: iframe Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: text/html

<html><body>
<iframe src="https://evil.com"></iframe>
<p>Safe content</p>
</body></html>`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: true
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.htmlBody).not.toContain('iframe');
      expect(result.output.message.htmlBody).toContain('Safe content');
    });

    it('should skip sanitization if disabled', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: No Sanitization
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: text/html

<html><script>alert('xss')</script><p>Content</p></html>`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: false
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      // Should contain script when sanitization is disabled
      expect(result.output.message.htmlBody).toContain('script');
    });
  });

  describe('RFC 2047 Header Decoding', () => {
    it('should decode RFC 2047 encoded subject', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: =?UTF-8?B?QmFuYW5h?= Split =?UTF-8?B?QXBwbGU=?=
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Body`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      // Should decode: "Banana Split Apple"
      expect(result.output.message.subject).toContain('Banana');
      expect(result.output.message.subject).toContain('Apple');
    });
  });

  describe('Attachment Size Limits', () => {
    it('should exclude attachments exceeding size limit', async () => {
      const base64Content = Buffer.from('x'.repeat(100)).toString('base64');

      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Large Attachment
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/mixed; boundary="boundary"

--boundary
Content-Type: text/plain

Body text

--boundary
Content-Type: application/octet-stream
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="large.bin"

${base64Content}

--boundary--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        maxAttachmentSize: 50 // 50 bytes limit
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      // Attachment should be excluded due to size limit
      expect(result.output.message.attachmentCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should return error when missing From header', async () => {
      const rawMessage = `To: recipient@example.com
Subject: No From Header
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Body`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.status).toBe('error');
      expect(result.output.errors).toHaveLength(1);
      expect(result.output.errors[0].code).toBe('MISSING_FROM');
    });

    it('should return error when missing To header', async () => {
      const rawMessage = `From: sender@example.com
Subject: No To Header
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Body`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.status).toBe('error');
      expect(result.output.errors).toHaveLength(1);
      expect(result.output.errors[0].code).toBe('MISSING_TO');
    });

    it('should validate required parameters', () => {
      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: {}
      } as any;

      const validation = emailParserExecutor.validate(node);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid tenantId', () => {
      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: {
          rawMessage: 'test',
          tenantId: 123 // Invalid type
        }
      } as any;

      const validation = emailParserExecutor.validate(node);

      expect(validation.valid).toBe(false);
    });
  });

  describe('Complex Real-World Scenarios', () => {
    it('should parse complete realistic email', async () => {
      const rawMessage = `From: "Product Team" <product@company.com>
To: customer@example.com
CC: manager@company.com
Subject: Your Account Confirmation
Message-ID: <20260123.abc123@company.com>
Date: Mon, 23 Jan 2026 14:30:45 +0000
X-Priority: 1
Content-Type: multipart/alternative; boundary="boundary_001"

--boundary_001
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

Welcome to our service!=0D=0A=0D=0AYour account is ready.

--boundary_001
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: base64

PGh0bWw+PGJvZHk+PHA+V2VsY29tZSB0byBvdXIgc2VydmljZSE8L3A+PC9ib2R5PjwvaHRtbD4=

--boundary_001--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId,
        sanitizeHtml: true
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.status).toBe('success');
      expect(result.output.message.from).toBe('product@company.com');
      expect(result.output.message.to).toContain('customer@example.com');
      expect(result.output.message.cc).toContain('manager@company.com');
      expect(result.output.message.subject).toBe('Your Account Confirmation');
      expect(result.output.message.priority).toBe('high');
      expect(result.output.message.textBody).toBeDefined();
      expect(result.output.message.htmlBody).toBeDefined();
    });

    it('should handle email with multiple attachments', async () => {
      const base64File1 = Buffer.from('file 1 content').toString('base64');
      const base64File2 = Buffer.from('file 2 content').toString('base64');

      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Multiple Attachments
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/mixed; boundary="boundary_mixed"

--boundary_mixed
Content-Type: text/plain

See the attached files.

--boundary_mixed
Content-Type: application/pdf
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="document.pdf"

${base64File1}

--boundary_mixed
Content-Type: application/zip
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="archive.zip"

${base64File2}

--boundary_mixed--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.message.attachmentCount).toBe(2);
      expect(result.output.message.attachments).toHaveLength(2);
      expect(result.output.message.attachments[0].filename).toBe('document.pdf');
      expect(result.output.message.attachments[1].filename).toBe('archive.zip');
    });
  });

  describe('Metrics Collection', () => {
    it('should collect accurate parsing metrics', async () => {
      const rawMessage = `From: sender@example.com
To: recipient@example.com
Subject: Test
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000
Content-Type: multipart/alternative; boundary="bound"

--bound
Content-Type: text/plain

Text body

--bound
Content-Type: text/html

<p>HTML body</p>

--bound--`;

      const config: EmailParserConfig = {
        rawMessage,
        tenantId
      };

      const node = {
        id: 'test-node',
        type: 'email-parser',
        parameters: config
      } as any;

      const result: any = await emailParserExecutor.execute(node, {} as any, {} as any);

      expect(result.output.metrics.parseDurationMs).toBeGreaterThanOrEqual(0);
      expect(result.output.metrics.headerCount).toBeGreaterThan(0);
      expect(result.output.metrics.partCount).toBeGreaterThan(1); // At least 2 parts (text + html)
      expect(result.output.metrics.attachmentCount).toBe(0);
    });
  });
});
