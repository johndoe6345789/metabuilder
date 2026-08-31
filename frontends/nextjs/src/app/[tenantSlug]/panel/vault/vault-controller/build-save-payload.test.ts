import { describe, expect, it } from 'vitest'

import { buildSavePayload } from './build-save-payload'
import type { VaultDraft } from '../vault-types'

const draft = (over: Partial<VaultDraft> = {}): VaultDraft => ({
  slug: '',
  title: 'My Entry',
  username: 'user',
  password: 'pass',
  group: '',
  notes: '',
  loginUrl: '',
  appUrl: '',
  ...over,
})

describe('buildSavePayload', () => {
  it('returns null when title is blank', () => {
    expect(buildSavePayload(draft({ title: '  ' }))).toBeNull()
  })

  it('returns null when username is blank', () => {
    expect(buildSavePayload(draft({ username: '  ' }))).toBeNull()
  })

  it('returns null when password is blank', () => {
    expect(buildSavePayload(draft({ password: '  ' }))).toBeNull()
  })

  it('derives a slug from the title when none is given', () => {
    const payload = buildSavePayload(draft({ title: 'My New Entry' }))
    expect(payload?.slug).toBe('my-new-entry')
  })

  it('keeps an explicit slug', () => {
    const payload = buildSavePayload(draft({ slug: 'custom-slug' }))
    expect(payload?.slug).toBe('custom-slug')
  })

  it('defaults a blank group to "General"', () => {
    const payload = buildSavePayload(draft({ group: '   ' }))
    expect(payload?.group).toBe('General')
  })

  it('trims every text field', () => {
    const payload = buildSavePayload(
      draft({ title: '  T  ', username: '  u  ', notes: '  n  ' })
    )
    expect(payload).toMatchObject({ title: 'T', username: 'u', notes: 'n' })
  })
})
