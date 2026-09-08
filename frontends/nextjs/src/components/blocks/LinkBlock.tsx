'use client'

import { usePathname } from 'next/navigation'

import { BASE_PATH } from '@/lib/app-config'
import { propText } from './block-coerce'
import type { BlockAttrs } from './common-attrs'
import { navBaseFromPathname, resolveNavHref } from './nav-href'

/**
 * The Link block.
 *
 * A component rather than a few lines of JSX because it needs the current
 * path to know which site it is part of -- the same reason NavBarLinks
 * is one. The block emitted `href` verbatim: its own placeholder is
 * "/contact", its hint says "a page path", and a founder typing exactly
 * that got a link to /contact rather than /app/{tenant}/contact -- so
 * every internal link on a published page 404'd. nav-href.ts exists to
 * fix this and only the nav bar was calling it.
 *
 * `attrs` is what renderNode cloned onto this component; forwarded onto
 * the <a>, since a component drops the props it does not name.
 */
export function LinkBlock({
  p,
  ...attrs
}: { p: Record<string, unknown> } & BlockAttrs) {
  const base = navBaseFromPathname(usePathname(), BASE_PATH)
  return (
    <a href={resolveNavHref(propText(p.href, '#'), base)} {...attrs}>
      {propText(p.text, 'Link')}
    </a>
  )
}
