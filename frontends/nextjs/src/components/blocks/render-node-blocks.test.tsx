import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { renderNode, type TreeNode } from './block-registry'

const node = (
  type: string,
  props = {},
  children: TreeNode[] = []
): TreeNode => ({ id: type, type, props, children })

const html = (n: TreeNode): string =>
  render(<>{renderNode(n)}</>).container.innerHTML

describe('renderNode block types', () => {
  it.each([
    ['html.h1', 'h1'],
    ['html.h2', 'h2'],
    ['html.h3', 'h3'],
    ['html.p', 'p'],
    ['html.span', 'span'],
    ['html.section', 'section'],
  ])('renders %s as <%s>', (type, tag) => {
    expect(html(node(type))).toContain(`<${tag}`)
  })

  it('renders the text a block was given', () => {
    expect(html(node('html.p', { text: 'Hello' }))).toContain('Hello')
  })

  it('falls back to the default text when none is set', () => {
    // A block dropped from the palette should show something, not nothing.
    expect(html(node('html.h1'))).toContain('Heading 1')
  })

  it('renders children inside a container', () => {
    const out = html(
      node('html.section', {}, [node('html.p', { text: 'inner' })])
    )
    expect(out).toContain('inner')
  })

  it('names an unknown block rather than rendering nothing', () => {
    // Silence would look like a broken page; the name says what to fix.
    expect(html(node('not.a.block'))).toContain('not.a.block')
  })

  it('escapes text rather than interpreting it as markup', () => {
    const out = html(node('html.p', { text: '<script>x</script>' }))
    expect(out).not.toContain('<script>')
  })
})

/**
 * A founder who adds an image block and publishes before pasting an
 * address shipped the italic text "Image: no src set" to every visitor.
 * That notice belongs in the builder, which now says it through the prop
 * schema; the published page shows nothing.
 */
describe('an image block with no address', () => {
  it('renders nothing rather than a builder notice', () => {
    expect(html(node('image', { src: '' }))).not.toContain('no src set')
    expect(html(node('image', { src: '' }))).not.toContain('<img')
  })

  it('still renders the image once it has one', () => {
    expect(html(node('image', { src: 'https://x/y.png', alt: 'y' }))).toContain(
      '<img'
    )
  })
})
