import { describe, expect, it } from 'vitest'

import {
  ALLOWED,
  bucketFor,
  MAX_BYTES,
  refuseUpload,
  safeAssetKey,
} from './upload-policy'

const file = (name: string, type = 'image/png', size = 4): File =>
  new File([new Uint8Array(size)], name, { type })

describe('bucketFor', () => {
  it('namespaces the bucket by tenant', () => {
    expect(bucketFor('acme')).toBe('tenant-acme')
    expect(bucketFor('system')).toBe('tenant-system')
  })
})

describe('safeAssetKey', () => {
  it('keeps a name that is already safe', () => {
    expect(safeAssetKey('logo.png')).toBe('logo.png')
    expect(safeAssetKey('a_b-c.1.png')).toBe('a_b-c.1.png')
  })

  // The key becomes a URL path segment, so anything that could change the
  // meaning of that path is replaced rather than kept.
  it.each([
    ['a b.png', 'a-b.png'],
    ['a/b.png', 'a-b.png'],
    ['a\\b.png', 'a-b.png'],
    ['?q=1.png', 'q-1.png'],
    ['../../etc/passwd', 'etc-passwd'],
    ['--lead.png', 'lead.png'],
    ['..hidden.png', 'hidden.png'],
  ])('rewrites %s to %s', (name, expected) => {
    expect(safeAssetKey(name)).toBe(expected)
  })

  it.each(['a/b/c.png', '..\\..\\x', '../x.png'])(
    'leaves no separator in %s',
    name => {
      expect(safeAssetKey(name)).not.toMatch(/[/\\]/)
    }
  )

  // A name made only of characters that are not allowed sanitises to
  // nothing; writing an object under the empty key would store a file
  // whose URL reads back nothing at all.
  it.each(['', '???', '///', '..', '日本語'])(
    'falls back to a generated name for %s',
    name => {
      expect(safeAssetKey(name, 1700)).toBe('asset-1700')
    }
  )

  it('caps a very long name', () => {
    expect(safeAssetKey('a'.repeat(400))).toHaveLength(128)
  })
})

describe('refuseUpload', () => {
  it.each([...ALLOWED])('allows %s', type => {
    expect(refuseUpload(file('x', type))).toBeNull()
  })

  it.each(['text/html', 'application/javascript', 'text/plain', ''])(
    'refuses %s with 415',
    type => {
      expect(refuseUpload(file('x', type))?.status).toBe(415)
    }
  )

  it('names the type it refused', () => {
    expect(refuseUpload(file('x', 'text/html'))?.error).toContain('text/html')
  })

  it('describes a typeless file without an empty gap', () => {
    expect(refuseUpload(file('x', ''))?.error).toBe(
      'That file type is not allowed'
    )
  })

  it('refuses a file over the size cap with 413', () => {
    const big = file('x', 'image/png', MAX_BYTES + 1)
    expect(refuseUpload(big)?.status).toBe(413)
  })

  it('allows a file of exactly the size cap', () => {
    expect(refuseUpload(file('x', 'image/png', MAX_BYTES))).toBeNull()
  })

  it('checks the type before the size', () => {
    const big = file('x', 'text/html', MAX_BYTES + 1)
    expect(refuseUpload(big)?.status).toBe(415)
  })
})
