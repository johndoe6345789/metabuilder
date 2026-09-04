'use client'

/**
 * On-site reference for BQL syntax. Kept in lockstep with DBAL's parser
 * (dbal/production/src/bql/bql_parser.cpp) -- every form and example here
 * is real, parseable syntax, not a simplification of it.
 */

import { HOMEPAGE_EXAMPLE } from './bql-docs-example'
import s from './BqlTab.module.scss'

const FORMS: { title: string; syntax: string; example: string }[] = [
  {
    title: 'Start a page from scratch',
    syntax: 'start a new page',
    example: 'start a new page',
  },
  {
    title: 'Add a block',
    syntax: 'add a <block> [called <name>] [that says "<text>"] [with <field> of <value>, ...]',
    example: 'add a Button called heroCta that says "Join now" with style of "Solid"',
  },
  {
    title: 'Add a block inside another',
    syntax: 'inside <name>, add a <block> ...',
    example: 'inside hero, add a Heading 1 that says "Community Darkroom"',
  },
  {
    title: 'Change a named block',
    syntax: 'give <name> <field> of <value>, ...',
    example: 'give heroCta style of "Solid"',
  },
  {
    title: 'Define a reusable style',
    syntax: 'make a style called "<name>" [with <property> of <value>, ...]',
    example: 'make a style called "hero-panel" with background of "#1a1a1a", padding of 32',
  },
  {
    title: 'Apply a style',
    syntax: 'apply "<style>" [, "<style>" ...] to <name>',
    example: 'apply "hero-panel" to hero',
  },
  {
    title: 'Say where the page goes',
    syntax: 'publish this [as "<title>"] at <path>',
    example: 'publish this as "About" at /about',
  },
]


export function BqlDocsPanel() {
  return (
    <div className={s.docs}>
      <p className={s.docsIntro}>
        BQL builds a page from plain English sentences, one per line. A
        field's name is whatever it's called in the Properties tab --
        &quot;Style&quot;, not <code>variant</code> -- so nothing here needs a
        separate glossary. A line starting with <code>#</code> is a comment;
        blank lines are ignored. Either every line applies, or none does: the
        errors below always name the exact line to fix.
      </p>

      {FORMS.map(f => (
        <div key={f.title} className={s.form}>
          <div className={s.formTitle}>{f.title}</div>
          <code className={s.syntax}>{f.syntax}</code>
          <code className={s.exampleLine}>{f.example}</code>
        </div>
      ))}

      <div className={s.formTitle}>A whole page, start to finish</div>
      <pre className={s.exampleBlock}>{HOMEPAGE_EXAMPLE}</pre>
    </div>
  )
}
