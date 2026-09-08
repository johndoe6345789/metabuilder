import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/navigation', () => ({ usePathname: () => '/acme/about' }))

import { BASE_PATH } from '@/lib/app-config'
import { renderNode } from './block-registry'

const link = (href: string) =>
  render(
    <>
      {renderNode({
        id: 'l1',
        type: 'html.a',
        props: { href, text: 'Go' },
        children: [],
      })}
    </>
  ).container.querySelector('a')

/**
 * The Link block emitted `href` verbatim. Its own placeholder is "/contact"
 * and its hint says "a page path", so a founder typing exactly that got a
 * link to /contact -- not /app/{tenant}/contact -- and every internal link
 * on a published page 404'd. nav-href.ts exists to fix this; only the nav
 * bar was calling it.
 */
describe('the Link block on a published page', () => {
  it('sends a page path into this community, under the basePath', () => {
    expect(link('/contact')?.getAttribute('href')).toBe(
      `${BASE_PATH}/acme/contact`
    )
  })

  it('leaves a full web address alone', () => {
    expect(link('https://example.com/x')?.getAttribute('href')).toBe(
      'https://example.com/x'
    )
  })

  it('leaves a relative path to resolve against the current page', () => {
    expect(link('faq')?.getAttribute('href')).toBe('faq')
  })
})
