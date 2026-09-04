'use client'

/**
 * On-site reference for BQL syntax. Kept in lockstep with DBAL's parser
 * (dbal/production/src/bql/bql_parser.cpp) -- every form and example here
 * is real, parseable syntax, not a simplification of it.
 */

import s from './BqlTab.module.scss'

const FORMS: { title: string; syntax: string; example: string }[] = [
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

const HOMEPAGE_EXAMPLE = `# Hero
add a Container called hero with gap of 16
inside hero, add a Heading 1 that says "Community Darkroom"
inside hero, add a Paragraph that says "A home for film photographers to share prints, trade notes, and find a darkroom to borrow."
inside hero, add a Button called heroCta that says "Join now"
give heroCta style of "Solid"

# Two cards side by side
add a Container called cardRow with direction of "Across the page", gap of 24
inside cardRow, add a Container called card1 with gap of 8
inside card1, add a Heading 3 that says "Community darkrooms"
inside card1, add a Paragraph that says "Find a shared darkroom near you."
inside cardRow, add a Container called card2 with gap of 8
inside card2, add a Heading 3 that says "Print swaps"
inside card2, add a Paragraph that says "Trade prints with other members."

# An alert
add an Alert that says "New: weekend darkroom slots just opened up." with kind of "Information"

# Styling
make a style called "hero-panel" with background of "#1a1a1a", padding of 32
apply "hero-panel" to hero

# Where it lives
publish this as "Home" at /`

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
