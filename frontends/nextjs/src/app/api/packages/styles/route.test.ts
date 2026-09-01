import { describe, expect, it, vi } from 'vitest'

const fs = vi.hoisted(() => ({ readFile: vi.fn() }))
vi.mock('fs', () => ({ promises: fs, default: { promises: fs } }))

import { GET } from './route'

const req = (query: string) =>
  ({
    nextUrl: new URL(`http://localhost/api/packages/styles${query}`),
  }) as unknown as Parameters<typeof GET>[0]

describe('GET /api/packages/styles', () => {
  it('is 400 for a missing id', async () => {
    const res = await GET(req(''))
    expect(res.status).toBe(400)
  })

  it('is 400 for an id with disallowed characters', async () => {
    const res = await GET(req('?id=../../etc/passwd'))
    expect(res.status).toBe(400)
  })

  it('renders :root and dark blocks from cssVars/cssVarsDark', async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({
        cssVars: { '--pkg-color': 'blue' },
        cssVarsDark: { '--pkg-color': 'navy' },
      })
    )
    const res = await GET(req('?id=blog'))
    const text = await res.text()
    expect(text).toContain(':root {\n  --pkg-color: blue;\n}')
    expect(text).toContain(
      '[data-theme="dark"] {\n  --pkg-color: navy;\n}'
    )
    expect(res.headers.get('Content-Type')).toBe('text/css')
  })

  it('renders prefixed color variables from the colors map', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ colors: { brand: 'red' } }))
    const res = await GET(req('?id=blog'))
    const text = await res.text()
    expect(text).toContain('--pkg-blog-brand: red;')
  })

  it('omits empty blocks entirely', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ cssVars: {} }))
    const res = await GET(req('?id=blog'))
    const text = await res.text()
    expect(text).not.toContain(':root')
  })

  it('answers a stub comment when the tokens file is missing', async () => {
    fs.readFile.mockRejectedValue(new Error('ENOENT'))
    const res = await GET(req('?id=missing'))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('/* not found */')
  })

  it('answers a stub comment for malformed JSON', async () => {
    fs.readFile.mockResolvedValue('{not json')
    const res = await GET(req('?id=blog'))
    expect(await res.text()).toBe('/* not found */')
  })
})
