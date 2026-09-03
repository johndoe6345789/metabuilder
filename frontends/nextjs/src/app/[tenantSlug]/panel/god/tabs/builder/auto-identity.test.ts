import { describe, expect, it } from 'vitest'
import type { TreeNode } from './builder-registry'
import { autoId, identitySource, slugify, uniqueSlug } from './auto-identity'

describe('identitySource', () => {
  it('uses a heading\'s own text', () => {
    expect(identitySource('html.h1', { text: 'Community Darkroom' })).toBe(
      'Community Darkroom'
    )
  })

  it('uses a button\'s label, not a generic "text" field', () => {
    expect(identitySource('button', { label: 'Join now' })).toBe('Join now')
  })

  it('uses a list item\'s title, not its icon field', () => {
    expect(
      identitySource('list-item', { icon: 'star', title: 'Darkroom access' })
    ).toBe('Darkroom access')
  })

  it('falls back to the aria-label when the block has no text of its own', () => {
    expect(
      identitySource('divider', { ariaLabel: 'Section break' })
    ).toBe('Section break')
  })

  it('falls back to the Name field when there is no text or aria-label', () => {
    expect(identitySource('divider', { name: 'section-break' })).toBe(
      'section-break'
    )
  })

  it('falls back to the block\'s own plain-language name as a last resort', () => {
    expect(identitySource('divider', {})).toBe('Divider')
  })

  it('ignores blank text and keeps falling back', () => {
    expect(
      identitySource('html.h1', { text: '   ', ariaLabel: 'Section break' })
    ).toBe('Section break')
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Community Darkroom')).toBe('community-darkroom')
  })

  it('collapses punctuation runs into a single hyphen', () => {
    expect(slugify('Trade prints — and enjoy it!')).toBe(
      'trade-prints-and-enjoy-it'
    )
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--Hello--')).toBe('hello')
  })

  it('truncates very long text', () => {
    const long = 'a'.repeat(80)
    expect(slugify(long).length).toBeLessThanOrEqual(40)
  })

  it('never leaves a trailing hyphen after truncation', () => {
    const value = `${'a'.repeat(39)} b`
    expect(slugify(value).endsWith('-')).toBe(false)
  })
})

describe('uniqueSlug', () => {
  const tree = (ids: (string | undefined)[]): TreeNode => ({
    id: 'root',
    type: 'container',
    props: {},
    children: ids.map((id, i) => ({
      id: `n${i}`,
      type: 'html.p',
      props: id === undefined ? {} : { id },
      children: [],
    })),
  })

  it('returns the base slug when nothing else uses it', () => {
    expect(uniqueSlug('hero', tree([]), 'new')).toBe('hero')
  })

  it('appends -2 when the base slug is already taken', () => {
    expect(uniqueSlug('hero', tree(['hero']), 'new')).toBe('hero-2')
  })

  it('keeps incrementing past multiple collisions', () => {
    expect(uniqueSlug('hero', tree(['hero', 'hero-2', 'hero-3']), 'new')).toBe(
      'hero-4'
    )
  })

  it('does not collide with itself when editing an existing node', () => {
    expect(uniqueSlug('hero', tree(['hero']), 'n0')).toBe('hero')
  })

  it('returns empty for an empty base', () => {
    expect(uniqueSlug('', tree([]), 'new')).toBe('')
  })
})

describe('autoId', () => {
  const root: TreeNode = {
    id: 'root',
    type: 'container',
    props: {},
    children: [
      { id: 'existing', type: 'html.h1', props: { id: 'community-darkroom' }, children: [] },
    ],
  }

  it('produces a unique, id-safe slug from a new node\'s own text', () => {
    expect(autoId('html.h1', { text: 'Join Now' }, root, 'new')).toBe(
      'join-now'
    )
  })

  it('disambiguates from an id already used elsewhere in the tree', () => {
    expect(
      autoId('html.h1', { text: 'Community Darkroom' }, root, 'new')
    ).toBe('community-darkroom-2')
  })
})
