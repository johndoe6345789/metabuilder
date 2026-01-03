/**
 * Password utilities stub
 * TODO: Implement password hashing and verification
 */

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}
