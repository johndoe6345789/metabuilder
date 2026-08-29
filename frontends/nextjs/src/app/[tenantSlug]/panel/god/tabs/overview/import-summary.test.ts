import { describe, expect, it } from 'vitest'

import { summariseImport } from './import-summary'

describe('summariseImport', () => {
  it('counts the collections in a valid export', () => {
    const flash = summariseImport(
      JSON.stringify({ data: { users: [], pages: [] } })
    )
    expect(flash.severity).toBe('info')
    expect(flash.message).toContain('(2 collections)')
  })

  it('reports zero collections for an export with no data', () => {
    expect(summariseImport(JSON.stringify({}))).toMatchObject({
      severity: 'info',
      message: expect.stringContaining('(0 collections)'),
    })
  })

  it.each([null, 'text', 7, []])(
    'reports zero collections when data is %p',
    data => {
      expect(summariseImport(JSON.stringify({ data }))).toMatchObject({
        message: expect.stringContaining('(0 collections)'),
      })
    }
  )

  // Nothing here writes -- applying an import is the Deploy tab's job, so
  // the message must not imply any data changed.
  it('says the file was validated, not applied', () => {
    const message = summariseImport(JSON.stringify({ data: {} })).message
    expect(message).toContain('validated')
    expect(message).toContain('Apply imports from Deploy')
  })

  it.each(['not json', '', '{ "data": '])('warns about %p', raw => {
    expect(summariseImport(raw)).toEqual({
      severity: 'warning',
      message: 'Import file is not valid MetaBuilder JSON.',
    })
  })
})
