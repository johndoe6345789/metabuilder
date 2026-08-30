/** The SMTP form's fields, declared once so the editor can map over them. */

import type { SmtpConfig } from '../use-smtp-config'

/** Every string-valued SMTP field -- port and secure are handled apart
 *  from this list since they aren't plain text inputs. */
export type SmtpTextKey = Exclude<keyof SmtpConfig, 'port' | 'secure'>

export interface SmtpFieldDef {
  key: SmtpTextKey
  label: string
  type: 'text' | 'password'
}

export const SMTP_FIELDS: SmtpFieldDef[] = [
  { key: 'host', label: 'Host', type: 'text' },
  { key: 'username', label: 'Username', type: 'text' },
  // Masked: this value is a real credential, not display content, and
  // this panel otherwise renders every field as plain text.
  { key: 'password', label: 'Password', type: 'password' },
  { key: 'fromEmail', label: 'From email', type: 'text' },
  { key: 'fromName', label: 'From name', type: 'text' },
]
