/** What an uploaded export file turns out to be. */

export interface Flash {
  severity: 'success' | 'info' | 'warning'
  message: string
}

/**
 * Validation only. Nothing here writes: applying an import is the Deploy
 * tab's job, and the message says so rather than implying data changed.
 */
export function summariseImport(raw: string): Flash {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const data = parsed.data
    const collections =
      data !== null && typeof data === 'object' ? Object.keys(data).length : 0
    return {
      severity: 'info',
      message:
        `Import file validated (${collections} collections). ` +
        'Apply imports from Deploy when you are ready to mutate data.',
    }
  } catch {
    return {
      severity: 'warning',
      message: 'Import file is not valid MetaBuilder JSON.',
    }
  }
}
