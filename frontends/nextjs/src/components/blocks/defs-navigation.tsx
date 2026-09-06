'use client'
/** Navigation blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import { propText, parseNavLinks } from './block-coerce'
import { m } from './defs-shared'
import { NavBarLinks } from './NavBarLinks'
import s from './nav-header.module.scss'

export const NAVIGATION_DEFS: BlockDef[] = [
  {
    meta: m('nav.header', 'Nav bar', 'menu', 'Navigation', false, {
      // No brand default: it would arrive pre-filled with the words "Site
      // name" and typing would append to them. The render below falls back
      // to the same words, so an untouched nav still reads sensibly. The
      // links default stays -- a nav with no links is useless, and the row
      // editor makes them obviously editable.
      links: 'Home->/|About->/about|Contact->/contact',
    }),
    render: p => {
      const brand = propText(p.brand, 'Site name')
      const links = parseNavLinks(p.links)
      return (
        <nav className={s.navBar}>
          <span className={s.brand}>{brand}</span>
          <details className={s.burger}>
            <summary
              className={s.burgerIcon}
              aria-label="Toggle navigation menu"
            >
              <span />
              <span />
              <span />
            </summary>
          </details>
          <NavBarLinks links={links} />
        </nav>
      )
    },
  },
]
