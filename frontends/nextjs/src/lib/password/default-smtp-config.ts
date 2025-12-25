import type { SMTPConfig } from './smtp-config'

/**
 * Default SMTP configuration
 */
export const DEFAULT_SMTP_CONFIG: SMTPConfig = {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromEmail: 'noreply@metabuilder.com',
  fromName: 'MetaBuilder System',
}
