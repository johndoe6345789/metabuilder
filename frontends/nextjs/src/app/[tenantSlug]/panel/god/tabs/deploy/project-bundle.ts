/**
 * The file the Deploy tab writes and reads.
 *
 * It carried no record of whose work it was, and the import restored it
 * wholesale -- so one community's bundle dropped into another browser
 * became that community's drafts: their page tree, their CSS, their
 * workflows and the SMTP host, username and **password** the god slice
 * keeps. The tenant marker that guards the same slice against a tenant
 * switch lives in localStorage, not in the file, so nothing downstream
 * could tell the difference either.
 *
 * The bundle says who it belongs to now, and the import checks.
 */

export const BUNDLE_KIND = 'metabuilder-project'
export const BUNDLE_VERSION = 3

export interface ProjectBundle {
  kind: string
  version: number
  /** The community whose editor this came from. */
  tenant: string
  exportedAt: string
  god: unknown
  idb: unknown
}

export function buildBundle(
  tenant: string,
  god: unknown,
  idb: unknown,
  now: string = new Date().toISOString()
): ProjectBundle {
  return {
    kind: BUNDLE_KIND,
    version: BUNDLE_VERSION,
    tenant,
    exportedAt: now,
    god,
    idb,
  }
}

export type BundleRead =
  | { ok: true; bundle: ProjectBundle }
  | { ok: false; reason: string }

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/**
 * Reads a bundle, and says why not.
 *
 * A bundle from **version 2 or earlier** carries no tenant. Those are
 * accepted -- they were written before there was one to record -- but
 * they are reported as belonging to nobody, so the caller can warn
 * rather than silently adopting them.
 */
export function readBundle(text: string): BundleRead {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'That file is not JSON.' }
  }

  const raw = asRecord(parsed)
  if (raw?.kind !== BUNDLE_KIND) {
    return { ok: false, reason: 'That is not a MetaBuilder project file.' }
  }
  const version = typeof raw.version === 'number' ? raw.version : 0
  if (version > BUNDLE_VERSION) {
    return {
      ok: false,
      reason:
        `That file was written by a newer version (${version}); this ` +
        `panel reads up to ${BUNDLE_VERSION}.`,
    }
  }

  return {
    ok: true,
    bundle: {
      kind: BUNDLE_KIND,
      version,
      tenant: typeof raw.tenant === 'string' ? raw.tenant : '',
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
      god: raw.god,
      idb: raw.idb,
    },
  }
}

/** Why this bundle must not be imported here, or null if it may be. */
export function refuseImport(
  bundle: ProjectBundle,
  tenant: string
): string | null {
  if (bundle.tenant === '') return null
  if (bundle.tenant === tenant) return null
  return (
    `That project belongs to "${bundle.tenant}" and you are in ` +
    `"${tenant}". Importing it would make their drafts, styles and mail ` +
    'settings yours. Sign in to that community to restore it there.'
  )
}
