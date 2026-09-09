import { describe, expect, it } from 'vitest'

import {
  BUNDLE_VERSION,
  buildBundle,
  readBundle,
  refuseImport,
} from './project-bundle'

const bundle = buildBundle('harbour', { tree: 1 }, { versions: [] }, 'NOW')

describe('buildBundle', () => {
  it('records whose work it is, and when', () => {
    expect(bundle).toMatchObject({
      kind: 'metabuilder-project',
      version: BUNDLE_VERSION,
      tenant: 'harbour',
      exportedAt: 'NOW',
    })
  })

  it('carries the editor state and the browser store', () => {
    expect(bundle.god).toEqual({ tree: 1 })
    expect(bundle.idb).toEqual({ versions: [] })
  })
})

describe('readBundle', () => {
  it('reads one it wrote', () => {
    const read = readBundle(JSON.stringify(bundle))
    expect(read.ok && read.bundle.tenant).toBe('harbour')
  })

  it.each([
    ['not json at all', 'not json', 'not JSON'],
    ['another kind of file', '{"kind":"something-else"}', 'not a MetaBuilder'],
    ['a bare array', '[]', 'not a MetaBuilder'],
  ])('refuses %s', (_case, text, expected) => {
    const read = readBundle(text)
    expect(read.ok).toBe(false)
    expect(!read.ok && read.reason).toContain(expected)
  })

  it('refuses a file from a newer panel rather than half-reading it', () => {
    const read = readBundle(
      JSON.stringify({ ...bundle, version: BUNDLE_VERSION + 1 })
    )
    expect(read.ok).toBe(false)
    expect(!read.ok && read.reason).toContain('newer version')
  })

  /** Bundles written before there was a tenant to record still open. */
  it('accepts an older bundle as belonging to nobody', () => {
    const old = { kind: 'metabuilder-project', version: 2, god: {}, idb: {} }
    const read = readBundle(JSON.stringify(old))
    expect(read.ok && read.bundle.tenant).toBe('')
  })
})

/**
 * The god slice holds the page tree, the CSS, the workflows and the SMTP
 * host, username and password. A bundle dropped into another browser
 * became that community's drafts, and the tenant marker that guards the
 * same slice lives in localStorage rather than in the file, so nothing
 * downstream could tell either.
 */
describe('refuseImport', () => {
  it('lets a community restore its own work', () => {
    expect(refuseImport(bundle, 'harbour')).toBeNull()
  })

  it("refuses another community's, and says why", () => {
    const reason = refuseImport(bundle, 'kestrel') ?? ''
    expect(reason).toContain('harbour')
    expect(reason).toContain('kestrel')
    expect(reason).toContain('mail settings')
  })

  it('lets an older bundle through, having no owner to check', () => {
    expect(refuseImport({ ...bundle, tenant: '' }, 'kestrel')).toBeNull()
  })
})
