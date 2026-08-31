import type { VaultDraft } from '../vault-types'
import { normalizeSlug } from '../vault-normalize'

/** The trimmed, slugged entry to save, or null when a required field
 *  (slug, title, username, password) is blank. */
export function buildSavePayload(draft: VaultDraft): VaultDraft | null {
  const slug = normalizeSlug(
    draft.slug || draft.title || draft.username || 'entry'
  )
  const required = [
    slug,
    draft.title.trim(),
    draft.username.trim(),
    draft.password.trim(),
  ]
  if (required.some(value => value.length === 0)) return null

  return {
    ...draft,
    slug,
    title: draft.title.trim(),
    username: draft.username.trim(),
    group: draft.group.trim() || 'General',
    notes: draft.notes.trim(),
    loginUrl: draft.loginUrl.trim(),
    appUrl: draft.appUrl.trim(),
  }
}
