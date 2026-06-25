export function generateScrambledPassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }
  
  return password
}

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
    message: 'Email simulated successfully (check console)'
  }
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

export const DEFAULT_SMTP_CONFIG: SMTPConfig = {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromEmail: 'noreply@metabuilder.com',
  fromName: 'MetaBuilder System',
}
