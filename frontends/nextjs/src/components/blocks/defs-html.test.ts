import { describe, expect, it } from 'vitest'
import { paletteItem } from './block-registry'

/** The builder shows `.name` to an author who should never need to already
 *  know HTML to use it -- a raw tag name ("Div", "H1") or a parenthetical
 *  like "(ul)" is exactly the kind of thing this guards against creeping
 *  back in as new blocks are added. */
describe('HTML block names are plain language, not raw tags', () => {
  const RAW_TAG_LIKE = /^h[1-6]$|^(div|span|ul|li|p|a)$/i

  it.each([
    'html.div',
    'html.section',
    'html.span',
    'html.p',
    'html.h1',
    'html.h2',
    'html.h3',
    'html.ul',
    'html.li',
    'html.a',
  ])('%s has a name that is not a bare tag', type => {
    const name = paletteItem(type)?.name
    expect(name).toBeDefined()
    expect(name).not.toMatch(RAW_TAG_LIKE)
    expect(name).not.toContain('(')
  })
})
