import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { renderNode, type TreeNode } from './block-registry'

const node = (props: Record<string, unknown> = {}): TreeNode => ({
  id: 'nav',
  type: 'nav.header',
  props,
  children: [],
})

const html = (n: TreeNode): string =>
  render(<>{renderNode(n)}</>).container.innerHTML

describe('nav.header', () => {
  it('renders the brand text', () => {
    expect(html(node({ brand: 'Lantern & Co' }))).toContain('Lantern &amp; Co')
  })

  it('falls back to a default brand when none is set', () => {
    expect(html(node())).toContain('Site name')
  })

  it('renders every link as a real anchor', () => {
    const out = html(
      node({ links: 'Home->/|About->/about|Contact->/contact' })
    )
    expect(out).toContain('href="/"')
    expect(out).toContain('>Home<')
    expect(out).toContain('href="/about"')
    expect(out).toContain('>About<')
    expect(out).toContain('href="/contact"')
    expect(out).toContain('>Contact<')
  })

  it('renders a details/summary disclosure for the burger, needing no script', () => {
    const out = html(node())
    expect(out).toContain('<details')
    expect(out).toContain('<summary')
    expect(out).toContain('aria-label="Toggle navigation menu"')
  })

  it('accepts the id an author sets, like every other block', () => {
    expect(html(node({ id: 'site-nav' }))).toContain('id="site-nav"')
  })
})
