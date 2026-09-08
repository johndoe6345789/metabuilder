/** The founder's messages as a spreadsheet, for anything but this panel. */

import { answerColumns, type Submission } from './submission-row'

/**
 * A cell that a spreadsheet would run rather than show.
 *
 * Every value here was typed by a stranger on the public internet, and
 * Excel and Sheets treat a leading =, +, - or @ as the start of a
 * formula -- so "=HYPERLINK(...)" in a contact form becomes a live link
 * in the founder's download. Prefixing with an apostrophe is the
 * standard defence: the cell shows the text and runs nothing.
 */
function defuse(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

/** One CSV field: defused, quoted, with any quote doubled. */
export function csvCell(value: string): string {
  const safe = defuse(value)
  return `"${safe.replaceAll('"', '""')}"`
}

const received = (row: Submission): string =>
  row.receivedAt === null ? '' : new Date(row.receivedAt).toISOString()

/**
 * The submissions as CSV: the row's own columns first, then one column
 * per field name used anywhere in the set, so a form that gained a field
 * halfway through still lines up.
 */
export function submissionsCsv(rows: Submission[]): string {
  const fields = answerColumns(rows)
  const header = ['Received', 'Form', 'Page', 'Status', ...fields]
  const lines = rows.map(row =>
    [
      received(row),
      row.formName,
      row.path,
      row.status,
      ...fields.map(f => row.data[f] ?? ''),
    ]
      .map(csvCell)
      .join(',')
  )
  return [header.map(csvCell).join(','), ...lines].join('\r\n')
}
