/** Handing the founder a file, without a server round trip. */

/**
 * Saves `text` as `filename`.
 *
 * Object URLs are revoked straight after the click: a leaked one keeps
 * the whole file in memory for the life of the page, and an inbox export
 * is as large as the founder's correspondence.
 */
export function downloadText(
  filename: string,
  text: string,
  type = 'text/csv;charset=utf-8'
): boolean {
  if (typeof document === 'undefined') return false
  if (typeof URL.createObjectURL !== 'function') return false
  const url = URL.createObjectURL(new Blob([text], { type }))
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    return true
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** A filename that says whose messages these are and when they were taken. */
export function csvFilename(tenant: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10)
  return `${tenant}-form-messages-${day}.csv`
}
