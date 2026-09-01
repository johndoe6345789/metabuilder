import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadJson } from './download-json'

describe('downloadJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a blob URL, clicks a download link, and revokes the URL', () => {
    const createObjectURL = vi.fn(() => 'blob:fake-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const click = vi.fn()
    const link = { href: '', download: '', click } as unknown as HTMLAnchorElement
    const doc = {
      createElement: vi.fn(() => link),
    } as unknown as Document

    downloadJson('export.json', { a: 1 }, doc)

    expect(doc.createElement).toHaveBeenCalledWith('a')
    expect(link.href).toBe('blob:fake-url')
    expect(link.download).toBe('export.json')
    expect(click).toHaveBeenCalledOnce()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
  })

  it('serialises the data as pretty-printed JSON in the blob', () => {
    const seen: unknown[] = []
    vi.stubGlobal('URL', {
      createObjectURL: (blob: Blob) => {
        seen.push(blob)
        return 'blob:x'
      },
      revokeObjectURL: vi.fn(),
    })
    const link = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement
    const doc = {
      createElement: vi.fn(() => link),
    } as unknown as Document

    downloadJson('f.json', { hello: 'world' }, doc)

    expect(seen).toHaveLength(1)
    expect((seen[0] as Blob).type).toBe('application/json')
  })
})
