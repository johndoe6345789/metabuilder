/** Shaping vault form values before they reach the API. */

import type { VaultDraft, VaultEntry } from './vault-types'

/** An empty form for "new entry", or the entry being edited. */
export function draftFromEntry(entry: VaultEntry | null): VaultDraft {
  return (
    entry ?? {
      slug: '',
      title: '',
      username: '',
      password: '',
      group: 'General',
      notes: '',
      loginUrl: '/app/login',
      appUrl: '/app',
    }
  )
}

/**
 * A slug is part of a URL, so anything outside [a-z0-9-] is folded to a
 * single dash rather than escaped. Runs collapse in the first replace, which
 * is why no separate de-duplication step is needed.
 */
export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
