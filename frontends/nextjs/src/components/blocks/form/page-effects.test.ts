import { describe, expect, it } from 'vitest'

import { applyPageEffects, effectRoot, type PageEffect } from './page-effects'

const page = (html: string): HTMLElement => {
  const root = document.createElement('div')
  root.innerHTML = html
  return root
}

const run = (root: ParentNode, ...effects: PageEffect[]) =>
  applyPageEffects(root, effects)

describe('what a workflow asked the page to do', () => {
  it('replaces text', () => {
    const root = page('<p id="status">Old</p>')
    run(root, { do: 'page.text', target: '#status', text: 'Booked' })
    expect(root.querySelector('#status')?.textContent).toBe('Booked')
  })

  it('hides and shows', () => {
    const root = page('<p id="a">A</p><p id="b" hidden>B</p>')

    run(root, { do: 'page.hide', target: '#a' }, { do: 'page.show', target: '#b' })

    expect(root.querySelector('#a')?.hasAttribute('hidden')).toBe(true)
    expect(root.querySelector('#b')?.hasAttribute('hidden')).toBe(false)
  })

  it('adds a class, so a tenant’s own styles can act', () => {
    const root = page('<p id="a">A</p>')
    run(root, { do: 'page.class', target: '#a', class: 'booked' })
    expect(root.querySelector('#a')?.classList.contains('booked')).toBe(true)
  })

  it('changes every element the selector matches', () => {
    const root = page('<p class="x">1</p><p class="x">2</p>')
    run(root, { do: 'page.text', target: '.x', text: 'same' })
    expect([...root.querySelectorAll('.x')].map(e => e.textContent)).toEqual([
      'same',
      'same',
    ])
  })

  // The caller owns the router and the rendering, so these come back
  // rather than happening here.
  it('returns a message and a destination rather than acting on them', () => {
    const root = page('')
    const out = run(
      root,
      { do: 'page.message', text: 'Thanks' },
      { do: 'page.go', path: '/thanks' }
    )
    expect(out).toEqual({ message: 'Thanks', go: '/thanks' })
  })

  it('has nothing to report when no effect asks for it', () => {
    expect(run(page(''), { do: 'page.text', target: '#x', text: 'y' })).toEqual({
      message: null,
      go: null,
    })
  })
})

/**
 * These arrive from a server over the wire, so the failure modes matter
 * more than the happy path.
 */
describe('an effect that cannot be applied', () => {
  it('does nothing when the selector matches nothing', () => {
    const root = page('<p id="a">A</p>')
    expect(() => run(root, { do: 'page.text', target: '#missing', text: 'x' }))
      .not.toThrow()
    expect(root.querySelector('#a')?.textContent).toBe('A')
  })

  // An invalid selector is the author's typo, not the visitor's problem.
  it('survives a selector that is not valid CSS', () => {
    const root = page('<p id="a">A</p>')
    expect(() => run(root, { do: 'page.text', target: '((', text: 'x' })).not.toThrow()
  })

  // An older page must not break on a newer workflow.
  it('skips a verb it does not know', () => {
    const root = page('<p id="a">A</p>')
    expect(() => run(root, { do: 'page.explode', target: '#a' })).not.toThrow()
    expect(root.querySelector('#a')?.textContent).toBe('A')
  })

  it('survives an effect with nothing in it', () => {
    expect(() => run(page(''), {}, { do: 'page.text' })).not.toThrow()
  })

  /**
   * Data, never anything executable. A workflow says "set this text", so
   * text that looks like markup has to arrive as text.
   */
  it('sets markup as text rather than as markup', () => {
    const root = page('<p id="a">A</p>')
    run(root, { do: 'page.text', target: '#a', text: '<img src=x onerror=1>' })
    expect(root.querySelector('#a')?.innerHTML).not.toContain('<img')
    expect(root.querySelector('#a')?.textContent).toContain('<img')
  })
})

/**
 * `page.go` means "another page of this site", so that is all it can do.
 * The path went straight to location.assign, where a javascript: or data:
 * URI runs as script -- turning a six-verb vocabulary of data into a way
 * to script somebody's browser.
 */
describe('where a workflow may send the browser', () => {
  it('allows a path within the site', () => {
    expect(run(page(''), { do: 'page.go', path: '/thanks' }).go).toBe('/thanks')
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'https://evil.example/steal',
    '//evil.example/steal',
    'vbscript:msgbox(1)',
    'thanks',
  ])('refuses %s', path => {
    expect(run(page(''), { do: 'page.go', path }).go).toBeNull()
  })

  it('ignores surrounding whitespace rather than being fooled by it', () => {
    expect(run(page(''), { do: 'page.go', path: '  /thanks  ' }).go).toBe(
      '/thanks'
    )
    expect(
      run(page(''), { do: 'page.go', path: '  javascript:alert(1)' }).go
    ).toBeNull()
  })
})

/**
 * Setting the text of a <script> or <style> is writing code, not writing
 * copy, and rewriting a form control edits what someone typed. None of
 * that is what the six verbs are for.
 */
describe('elements a workflow may not address', () => {
  it.each(['script', 'style', 'iframe', 'input', 'textarea'])(
    'will not touch a %s',
    tag => {
      const root = page(`<${tag} id="t"></${tag}>`)
      const before = root.querySelector('#t')?.textContent

      run(root, { do: 'page.text', target: '#t', text: 'alert(1)' })

      expect(root.querySelector('#t')?.textContent).toBe(before)
    }
  )

  it('still changes the ordinary elements in the same match', () => {
    const root = page('<p class="x">A</p><script class="x"></script>')

    run(root, { do: 'page.text', target: '.x', text: 'changed' })

    expect(root.querySelector('p')?.textContent).toBe('changed')
    expect(root.querySelector('script')?.textContent).toBe('')
  })

  it('will not add a class to one either', () => {
    const root = page('<script id="t"></script>')
    run(root, { do: 'page.class', target: '#t', class: 'x' })
    expect(root.querySelector('#t')?.classList.contains('x')).toBe(false)
  })
})

/**
 * The scope this module documents. Falling back to the document would
 * quietly restore the thing the scoping exists to prevent, so an unmarked
 * page gets nothing changed instead.
 */
describe('how far an effect may reach', () => {
  it('finds the page root from something inside it', () => {
    const root = page('<div data-page-root=""><p id="a">A</p></div>')
    const inside = root.querySelector('#a')

    expect(effectRoot(inside)).toBe(root.querySelector('[data-page-root]'))
  })

  it('has no root outside a rendered page', () => {
    const root = page('<p id="a">A</p>')
    expect(effectRoot(root.querySelector('#a'))).toBeNull()
    expect(effectRoot(null)).toBeNull()
  })
})
