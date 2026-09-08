import { afterEach, describe, expect, it, vi } from 'vitest'

import { csvFilename, downloadText } from './download-csv'

afterEach(() => vi.restoreAllMocks())

describe('csvFilename', () => {
  it('names the community and the day', () => {
    expect(csvFilename('acme', new Date('2026-09-08T10:00:00Z'))).toBe(
      'acme-form-messages-2026-09-08.csv'
    )
  })
})

describe('downloadText', () => {
  function stubObjectUrl() {
    const revoked: string[] = []
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(u => {
      revoked.push(u)
    })
    return revoked
  }

  it('clicks a link carrying the file and its name', () => {
    stubObjectUrl()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click')

    expect(downloadText('leads.csv', 'a,b')).toBe(true)

    const link = click.mock.instances[0] as HTMLAnchorElement
    expect(link.download).toBe('leads.csv')
    expect(link.getAttribute('href')).toBe('blob:x')
  })

  // A kept object URL holds the whole export in memory for the life of
  // the page, and this file is as large as the founder's correspondence.
  it('revokes the object URL once the click is made', () => {
    const revoked = stubObjectUrl()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined
    )

    downloadText('leads.csv', 'a,b')

    expect(revoked).toEqual(['blob:x'])
  })

  it('revokes it even when the click throws', () => {
    const revoked = stubObjectUrl()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => downloadText('leads.csv', 'a,b')).toThrow('blocked')
    expect(revoked).toEqual(['blob:x'])
  })

  // Redefining a global has to be undone in a finally: a failed
  // assertion above the restore leaves every later test in this worker
  // without createObjectURL, and they fail for no visible reason.
  it('says so where a browser cannot make one', () => {
    const original = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    Object.defineProperty(URL, 'createObjectURL', {
      value: undefined,
      configurable: true,
    })
    try {
      expect(downloadText('leads.csv', 'a,b')).toBe(false)
    } finally {
      if (original !== undefined) {
        Object.defineProperty(URL, 'createObjectURL', original)
      }
    }
  })

  it('leaves createObjectURL usable for whatever runs next', () => {
    expect(typeof URL.createObjectURL).toBe('function')
  })
})
