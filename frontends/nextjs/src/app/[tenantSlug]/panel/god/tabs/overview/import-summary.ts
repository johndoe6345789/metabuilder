/** What an uploaded export file turns out to be. */

export interface Flash {
  severity: 'success' | 'info' | 'warning'
  message: string
}

/**
 * Validation only. Nothing here writes, and the message says so rather
 * than implying data changed.
 *
 * It used to send the reader to the Deploy tab to apply it. Deploy
 * restores this browser's editor state and never touches the data layer,
 * so that was a dead end: an instruction to finish a job nothing in the
 * panel can do.
 */
export function summariseImport(raw: string, tenant?: string): Flash {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const data = parsed.data
    const collections =
      data !== null && typeof data === 'object' ? Object.keys(data).length : 0
    // The export records whose data it is, precisely so a restore cannot
    // put one community's rows into another -- and the reader ignored it,
    // so a founder validating someone else's backup was told only that it
    // was fine.
    const from = typeof parsed.tenant === 'string' ? parsed.tenant : ''
    const foreign =
      from !== '' && tenant !== undefined && from !== tenant
        ? ` It holds "${from}" data, not "${tenant}".`
        : ''
    return {
      severity: foreign === '' ? 'info' : 'warning',
      message:
        `Import file validated (${collections} collections).${foreign} ` +
        'Nothing in the panel writes it back yet — restoring a database ' +
        'export is a data-layer operation.',
    }
  } catch {
    return {
      severity: 'warning',
      message: 'Import file is not valid MetaBuilder JSON.',
    }
  }
}
