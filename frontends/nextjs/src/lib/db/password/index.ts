/**
 * Password utilities and SMTP configuration types
 */

export { hashPassword } from './hash-password'
export { verifyPassword } from './verify-password'

// SMTP Configuration type
export interface SMTPConfig {
  id?: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}
