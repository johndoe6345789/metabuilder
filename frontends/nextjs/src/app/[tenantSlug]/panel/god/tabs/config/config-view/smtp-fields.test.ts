import { describe, expect, it } from 'vitest'

import { SMTP_FIELDS } from './smtp-fields'

describe('SMTP_FIELDS', () => {
  it('excludes port and secure, which are not plain text fields', () => {
    const keys = SMTP_FIELDS.map(f => f.key)
    expect(keys).not.toContain('port')
    expect(keys).not.toContain('secure')
  })

  // The password is a real credential, not display content -- everything
  // else in this panel renders as plain text.
  it('masks only the password field', () => {
    const types = Object.fromEntries(SMTP_FIELDS.map(f => [f.key, f.type]))
    expect(types.password).toBe('password')
    for (const [key, type] of Object.entries(types)) {
      if (key !== 'password') expect(type).toBe('text')
    }
  })

  it('gives every field a label', () => {
    for (const field of SMTP_FIELDS) {
      expect(field.label.length).toBeGreaterThan(0)
    }
  })
})
