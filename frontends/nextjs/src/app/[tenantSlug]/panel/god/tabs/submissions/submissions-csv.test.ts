import { describe, expect, it } from 'vitest'

import { parseSubmission } from './submission-row'
import { csvCell, submissionsCsv } from './submissions-csv'

const row = (over: Record<string, unknown> = {}) =>
  parseSubmission({
    id: 'fs_1',
    formName: 'contact',
    path: '/contact',
    data: { name: 'Rosa' },
    createdAt: 1751500000,
    ...over,
  })

describe('csvCell', () => {
  it('quotes every value, so a comma cannot split a column', () => {
    expect(csvCell('Harbour, Cycle')).toBe('"Harbour, Cycle"')
  })

  it('doubles a quote rather than ending the field early', () => {
    expect(csvCell('the "good" one')).toBe('"the ""good"" one"')
  })

  /**
   * Everything in these files was typed by a stranger on the public
   * internet, and a spreadsheet runs a cell that opens with =, +, - or @.
   * A contact form was a way to put a formula in the founder's download.
   */
  it.each(['=1+1', '+1', '-1+1', '@SUM(A1)'])(
    'defuses %s so the spreadsheet shows it instead of running it',
    value => {
      expect(csvCell(value)).toBe(`"'${value}"`)
    }
  )

  it('defuses and quotes together', () => {
    expect(csvCell('=HYPERLINK("http://evil")')).toBe(
      '"\'=HYPERLINK(""http://evil"")"'
    )
  })

  it('leaves an ordinary value alone', () => {
    expect(csvCell('Rosa')).toBe('"Rosa"')
  })
})

describe('submissionsCsv', () => {
  it('heads the file with the row columns and every field used', () => {
    const csv = submissionsCsv([row(), row({ data: { email: 'r@x.test' } })])
    expect(csv.split('\r\n')[0]).toBe(
      '"Received","Form","Page","Status","email","name"'
    )
  })

  it('writes a line per submission', () => {
    expect(submissionsCsv([row(), row()]).split('\r\n')).toHaveLength(3)
  })

  it('leaves a field this submission did not carry empty', () => {
    const csv = submissionsCsv([row({ data: { name: 'Rosa' } }), row({
      data: { email: 'r@x.test' },
    })])
    expect(csv.split('\r\n')[1]).toContain('"","Rosa"')
  })

  it('writes the time in a form a spreadsheet can read', () => {
    expect(submissionsCsv([row()])).toContain('2025-07-02T23:46:40.000Z')
  })

  it('leaves the time empty when the row carried none', () => {
    const csv = submissionsCsv([row({ createdAt: null })])
    expect(csv.split('\r\n')[1].startsWith('"",')).toBe(true)
  })

  it('is just a header for no submissions', () => {
    expect(submissionsCsv([])).toBe('"Received","Form","Page","Status"')
  })
})
