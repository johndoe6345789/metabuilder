import type { SMTPConfig } from './smtp-config'

/**
 * Simulate sending an email (logs to console)
 */
export async function simulateEmailSend(
  to: string,
  subject: string,
  body: string,
  smtpConfig?: SMTPConfig
): Promise<{ success: boolean; message: string }> {
  console.log('=== EMAIL SIMULATION ===')
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${body}`)
  if (smtpConfig) {
    console.log(`SMTP Host: ${smtpConfig.host}:${smtpConfig.port}`)
    console.log(`From: ${smtpConfig.fromEmail}`)
  }
  console.log('========================')

  return {
    success: true,
    message: 'Email simulated successfully (check console)',
  }
}
