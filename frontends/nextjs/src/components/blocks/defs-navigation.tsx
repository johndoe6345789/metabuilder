'use client'
/** Navigation blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import { propText, parseNavLinks } from './block-coerce'
import { m } from './defs-shared'
import s from './nav-header.module.scss'

export const NAVIGATION_DEFS: BlockDef[] = [
  {
    meta: m('nav.header', 'Nav bar', 'menu', 'Navigation', false, {
      brand: 'Site name',
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
          <ul className={s.links}>
            {links.map(link => (
              <li key={`${link.label}-${link.href}`}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )
    },
  },
]
