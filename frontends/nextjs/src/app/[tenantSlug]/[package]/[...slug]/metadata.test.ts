import { describe, expect, it } from 'vitest'
import { generateMetadata } from './metadata'

const props = (slug: string[]) => ({
  params: Promise.resolve({ tenantSlug: 'acme', package: 'blog', slug }),
})

describe('generateMetadata', () => {
  it('titles a bare entity list', async () => {
    const { title } = await generateMetadata(props(['Post']))
    expect(title).toBe('Post - blog | acme | MetaBuilder')
  })

  it('titles a "new" entity page', async () => {
    const { title } = await generateMetadata(props(['Post', 'new']))
    expect(title).toBe('New Post - blog | acme | MetaBuilder')
  })

  it('titles a specific entity by id', async () => {
    const { title } = await generateMetadata(props(['Post', '42']))
    expect(title).toBe('Post #42 - blog | acme | MetaBuilder')
  })

  it('falls back to "unknown" for an empty slug', async () => {
    const { title } = await generateMetadata(props([]))
    expect(title).toBe('unknown - blog | acme | MetaBuilder')
  })
})
