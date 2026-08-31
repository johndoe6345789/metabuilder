import { describe, expect, it } from 'vitest'
import { PackageSchemas } from './package-schemas'

describe('PackageSchemas', () => {
  it.each(['blog', 'blog_posts', 'a1'])('accepts the id %p', id => {
    expect(PackageSchemas.packageId.safeParse(id).success).toBe(true)
  })

  // The same shape the route guard enforces before touching the disk.
  it.each(['Blog', '1blog', '_blog', 'blog-posts', '../etc', ''])(
    'rejects the id %p',
    id => {
      expect(PackageSchemas.packageId.safeParse(id).success).toBe(false)
    }
  )

  it.each(['1.0.0', '10.2.3', '1.0.0-beta.1'])(
    'accepts the version %p',
    version => {
      expect(PackageSchemas.version.safeParse(version).success).toBe(true)
    }
  )

  it.each(['1.0', 'v1.0.0', '', 'latest'])(
    'rejects the version %p',
    version => {
      expect(PackageSchemas.version.safeParse(version).success).toBe(false)
    }
  )

  it('defaults an install to enabled', () => {
    expect(
      PackageSchemas.installConfig.parse({ packageId: 'blog' })
    ).toMatchObject({ enabled: true })
  })
})
