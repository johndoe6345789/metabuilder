/**
 * SMTP Plugin - Email relay via smtprelay
 *
 * Enables workflow nodes to send emails through the SMTP relay server.
 * Integrates with the Python Twisted-based smtprelay project.
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as net from 'net';

const SMTP_PATH = path.resolve(__dirname, '../../../../smtprelay');
const DEFAULT_SMTP_HOST = 'localhost';
const DEFAULT_SMTP_PORT = 25;

export interface EmailInput {
  from: string;
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailOutput {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMTPServerStatus {
  running: boolean;
  host: string;
  port: number;
  queueSize?: number;
}

/**
 * Send an email via SMTP
 */
export async function smtpSendEmail(input: EmailInput & {
  smtpHost?: string;
  smtpPort?: number;
}): Promise<EmailOutput> {
  const {
    from,
    to,
    subject,
    body,
    html,
    cc,
    bcc,
    replyTo,
    headers = {},
    smtpHost = DEFAULT_SMTP_HOST,
    smtpPort = DEFAULT_SMTP_PORT,
  } = input;

  const recipients = Array.isArray(to) ? to : [to];
  const allRecipients = [...recipients, ...(cc || []), ...(bcc || [])];

  // Build email content
  const boundary = `----=_Part_${Date.now()}`;
  let emailContent = '';

  // Headers
  emailContent += `From: ${from}\r\n`;
  emailContent += `To: ${recipients.join(', ')}\r\n`;
  if (cc?.length) emailContent += `Cc: ${cc.join(', ')}\r\n`;
  emailContent += `Subject: ${subject}\r\n`;
  if (replyTo) emailContent += `Reply-To: ${replyTo}\r\n`;
  emailContent += `MIME-Version: 1.0\r\n`;

  for (const [key, value] of Object.entries(headers)) {
    emailContent += `${key}: ${value}\r\n`;
  }

  if (html) {
    emailContent += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    emailContent += `--${boundary}\r\n`;
    emailContent += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
    emailContent += `${body}\r\n\r\n`;
    emailContent += `--${boundary}\r\n`;
    emailContent += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
    emailContent += `${html}\r\n\r\n`;
    emailContent += `--${boundary}--\r\n`;
  } else {
    emailContent += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
    emailContent += body;
  }

  return new Promise((resolve) => {
    const socket = net.createConnection(smtpPort, smtpHost);
    let messageId = `<${Date.now()}@metabuilder>`;
    let step = 0;

    socket.on('data', (data) => {
      const response = data.toString();

      if (step === 0 && response.startsWith('220')) {
        socket.write(`HELO metabuilder\r\n`);
        step++;
      } else if (step === 1 && response.startsWith('250')) {
        socket.write(`MAIL FROM:<${from}>\r\n`);
        step++;
      } else if (step === 2 && response.startsWith('250')) {
        socket.write(`RCPT TO:<${allRecipients[0]}>\r\n`);
        step++;
      } else if (step === 3 && response.startsWith('250')) {
        socket.write(`DATA\r\n`);
        step++;
      } else if (step === 4 && response.startsWith('354')) {
        socket.write(`${emailContent}\r\n.\r\n`);
        step++;
      } else if (step === 5 && response.startsWith('250')) {
        socket.write(`QUIT\r\n`);
        resolve({ success: true, messageId });
      } else if (response.startsWith('5') || response.startsWith('4')) {
        resolve({ success: false, error: response.trim() });
        socket.destroy();
      }
    });

    socket.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    socket.on('timeout', () => {
      resolve({ success: false, error: 'Connection timeout' });
      socket.destroy();
    });

    socket.setTimeout(30000);
  });
}

/**
 * Check SMTP server status
 */
export async function smtpStatus(input: {
  host?: string;
  port?: number;
}): Promise<SMTPServerStatus> {
  const { host = DEFAULT_SMTP_HOST, port = DEFAULT_SMTP_PORT } = input;

  return new Promise((resolve) => {
    const socket = net.createConnection(port, host);

    socket.on('data', (data) => {
      const response = data.toString();
      if (response.startsWith('220')) {
        socket.write('QUIT\r\n');
        resolve({ running: true, host, port });
      }
    });

    socket.on('error', () => {
      resolve({ running: false, host, port });
    });

    socket.setTimeout(5000);
    socket.on('timeout', () => {
      resolve({ running: false, host, port });
      socket.destroy();
    });
  });
}

/**
 * Start the SMTP relay server
 */
export async function smtpStart(input: {
  port?: number;
}): Promise<{ success: boolean; pid?: number; error?: string }> {
  const { port = DEFAULT_SMTP_PORT } = input;

  return new Promise((resolve) => {
    try {
      const proc = spawn('python3', ['-m', 'smtp_relay', '--port', String(port)], {
        cwd: SMTP_PATH,
        detached: true,
        stdio: 'ignore',
      });

      proc.unref();

      // Give it a moment to start
      setTimeout(() => {
        resolve({ success: true, pid: proc.pid });
      }, 1000);
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

// Node definitions for workflow engine
export const smtpNodes = {
  'smtp.sendEmail': {
    description: 'Send an email via SMTP relay',
    inputs: ['from', 'to', 'subject', 'body', 'html', 'cc', 'bcc', 'replyTo', 'headers', 'smtpHost', 'smtpPort'],
    outputs: ['success', 'messageId', 'error'],
    execute: smtpSendEmail,
  },
  'smtp.status': {
    description: 'Check SMTP server status',
    inputs: ['host', 'port'],
    outputs: ['running', 'host', 'port', 'queueSize'],
    execute: smtpStatus,
  },
  'smtp.start': {
    description: 'Start the SMTP relay server',
    inputs: ['port'],
    outputs: ['success', 'pid', 'error'],
    execute: smtpStart,
  },
};
