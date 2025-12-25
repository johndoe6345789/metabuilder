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

export function generateDeterministicScrambledPassword(seed: string, length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let hash = 0x811c9dc5

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  let state = hash || 1
  let password = ''

  for (let i = 0; i < length; i++) {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    const rand = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    password += charset[Math.floor(rand * charset.length)]
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
