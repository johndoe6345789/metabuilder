import { describe, expect, it } from 'vitest'
import { installFetch } from '@/test/fetch-mock'
import type { TreeNode } from '../builder-registry'
import type { CssClass } from '../../styles/use-css-classes'
import type { BqlSentence } from './types'
import { applyBql } from './apply'

const root = (): TreeNode => ({
  id: 'root',
  type: 'container',
  props: {},
  children: [],
})

const findByAlias = (tree: TreeNode, path: number[]): TreeNode => {
  let node = tree
  for (const i of path) node = node.children[i]
  return node
}

/** Parsing itself now lives in DBAL (see the dbal repo's bql_parser.hpp,
 *  ported line-for-line from what used to be this app's local lexer/parser
 *  and covered by its own C++ test suite there). These tests mock DBAL's
 *  response with the exact sentences it would return for a given script,
 *  so this file tests only what's actually this app's job: resolving a
 *  parsed sentence against the real PALETTE/PROP_SCHEMAS and building a
 *  tree from it. */
const mockDbal = (sentences: BqlSentence[]) =>
  installFetch([{ match: '/bql/parse', body: { ok: true, sentences } }])

const mockDbalErrors = (errors: { line: number; message: string }[]) =>
  installFetch([{ match: '/bql/parse', body: { ok: false, errors } }])

describe('applyBql: a single block', () => {
  it('adds a block at the root with its content', async () => {
    mockDbal([
      { kind: 'add', line: 1, blockName: 'Heading 1', text: 'Hi there', attrs: [] },
    ])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toEqual([])
    const child = findByAlias(result.tree, [0])
    expect(child.type).toBe('html.h1')
    expect(child.props.text).toBe('Hi there')
  })

  it('rejects a block name that does not exist', async () => {
    mockDbal([{ kind: 'add', line: 1, blockName: 'Frobnicator', attrs: [] }])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toMatch(/No block called "Frobnicator"/)
    expect(result.tree).toEqual(root())
  })

  it('rejects a property that does not exist on the block, and applies nothing', async () => {
    mockDbal([
      {
        kind: 'add',
        line: 1,
        blockName: 'Container',
        alias: 'hero',
        attrs: [{ key: 'gap', value: '16' }],
      },
      {
        kind: 'give',
        line: 2,
        alias: 'hero',
        attrs: [{ key: 'rotation', value: '45' }],
      },
    ])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toHaveLength(1)
    expect(result.tree).toEqual(root())
  })

  it('surfaces a DBAL syntax error without touching the tree', async () => {
    mockDbalErrors([{ line: 1, message: `Didn't understand: "Please help"` }])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toEqual([
      { line: 1, message: `Didn't understand: "Please help"` },
    ])
    expect(result.tree).toEqual(root())
  })
})

describe('applyBql: nesting and aliases', () => {
  it('nests a child under a previously declared alias', async () => {
    mockDbal([
      {
        kind: 'add',
        line: 1,
        blockName: 'Container',
        alias: 'hero',
        attrs: [{ key: 'gap', value: '16' }],
      },
      {
        kind: 'add',
        line: 2,
        parentAlias: 'hero',
        blockName: 'Heading 1',
        text: 'Community Darkroom',
        attrs: [],
      },
      {
        kind: 'add',
        line: 3,
        parentAlias: 'hero',
        blockName: 'Button',
        alias: 'heroCta',
        text: 'Join now',
        attrs: [],
      },
      {
        kind: 'give',
        line: 4,
        alias: 'heroCta',
        attrs: [{ key: 'style', value: 'Solid' }],
      },
    ])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toEqual([])
    const hero = findByAlias(result.tree, [0])
    expect(hero.type).toBe('container')
    expect(hero.props.gap).toBe(16)
    expect(hero.children).toHaveLength(2)
    expect(hero.children[0].props.text).toBe('Community Darkroom')
    expect(hero.children[1].props.label).toBe('Join now')
    expect(hero.children[1].props.variant).toBe('contained')
  })

  it('reports an unknown parent alias without touching the tree', async () => {
    mockDbal([
      {
        kind: 'add',
        line: 1,
        parentAlias: 'ghost',
        blockName: 'Paragraph',
        text: 'x',
        attrs: [],
      },
    ])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toHaveLength(1)
    expect(result.tree).toEqual(root())
  })
})

describe('applyBql: styles', () => {
  it('defines a class and applies it to a node', async () => {
    mockDbal([
      { kind: 'add', line: 1, blockName: 'Container', alias: 'hero', attrs: [] },
      {
        kind: 'style',
        line: 2,
        name: 'hero-panel',
        attrs: [
          { key: 'background', value: '#1a1a1a' },
          { key: 'padding', value: '32' },
        ],
      },
      { kind: 'class', line: 3, names: ['hero-panel'], alias: 'hero' },
    ])
    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toEqual([])
    expect(result.classes).toEqual([
      {
        id: expect.any(String),
        name: 'hero-panel',
        props: { background: '#1a1a1a', padding: '32' },
      },
    ])
    const hero = findByAlias(result.tree, [0])
    expect(hero.props.className).toBe('hero-panel')
  })

  it('rejects applying a style that was never defined', async () => {
    mockDbal([
      { kind: 'add', line: 1, blockName: 'Container', alias: 'hero', attrs: [] },
      { kind: 'class', line: 2, names: ['ghost'], alias: 'hero' },
    ])
    const result = await applyBql(
      'irrelevant',
      'tenant',
      'root',
      root(),
      [] as CssClass[]
    )
    expect(result.errors).toHaveLength(1)
    expect(result.tree).toEqual(root())
  })
})

describe('applyBql: the whole Community Darkroom homepage in one script', () => {
  it('builds the entire page from one script with no errors', async () => {
    mockDbal([
      {
        kind: 'add',
        line: 3,
        blockName: 'Container',
        alias: 'hero',
        attrs: [{ key: 'gap', value: '16' }],
      },
      {
        kind: 'add',
        line: 4,
        parentAlias: 'hero',
        blockName: 'Heading 1',
        text: 'Community Darkroom',
        attrs: [],
      },
      {
        kind: 'add',
        line: 5,
        parentAlias: 'hero',
        blockName: 'Paragraph',
        text: 'A home for film photographers to share prints, trade notes, and find a darkroom to borrow.',
        attrs: [],
      },
      {
        kind: 'add',
        line: 6,
        parentAlias: 'hero',
        blockName: 'Button',
        alias: 'heroCta',
        text: 'Join now',
        attrs: [],
      },
      {
        kind: 'give',
        line: 7,
        alias: 'heroCta',
        attrs: [{ key: 'style', value: 'Solid' }],
      },
      {
        kind: 'add',
        line: 10,
        blockName: 'Container',
        alias: 'cardRow',
        attrs: [
          { key: 'direction', value: 'Across the page' },
          { key: 'gap', value: '24' },
        ],
      },
      {
        kind: 'add',
        line: 11,
        parentAlias: 'cardRow',
        blockName: 'Container',
        alias: 'card1',
        attrs: [{ key: 'gap', value: '8' }],
      },
      {
        kind: 'add',
        line: 12,
        parentAlias: 'card1',
        blockName: 'Heading 3',
        text: 'Community darkrooms',
        attrs: [],
      },
      {
        kind: 'add',
        line: 13,
        parentAlias: 'card1',
        blockName: 'Paragraph',
        text: 'Find a shared darkroom near you.',
        attrs: [],
      },
      {
        kind: 'add',
        line: 14,
        parentAlias: 'cardRow',
        blockName: 'Container',
        alias: 'card2',
        attrs: [{ key: 'gap', value: '8' }],
      },
      {
        kind: 'add',
        line: 15,
        parentAlias: 'card2',
        blockName: 'Heading 3',
        text: 'Print swaps',
        attrs: [],
      },
      {
        kind: 'add',
        line: 16,
        parentAlias: 'card2',
        blockName: 'Paragraph',
        text: 'Trade prints with other members.',
        attrs: [],
      },
      {
        kind: 'add',
        line: 19,
        blockName: 'Alert',
        text: 'New: weekend darkroom slots just opened up.',
        attrs: [{ key: 'kind', value: 'Information' }],
      },
      {
        kind: 'style',
        line: 22,
        name: 'hero-panel',
        attrs: [
          { key: 'background', value: '#1a1a1a' },
          { key: 'padding', value: '32' },
        ],
      },
      { kind: 'class', line: 23, names: ['hero-panel'], alias: 'hero' },
    ])

    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])
    expect(result.errors).toEqual([])

    const [hero, cardRow, alert] = result.tree.children
    expect(hero.type).toBe('container')
    expect(hero.props.className).toBe('hero-panel')
    expect(hero.children.map(c => c.type)).toEqual([
      'html.h1',
      'html.p',
      'button',
    ])
    expect(hero.children[2].props.variant).toBe('contained')

    expect(cardRow.props.direction).toBe('row')
    expect(cardRow.children).toHaveLength(2)
    expect(cardRow.children[0].children[0].props.text).toBe(
      'Community darkrooms'
    )
    expect(cardRow.children[1].children[1].props.text).toBe(
      'Trade prints with other members.'
    )

    expect(alert.type).toBe('m3.alert')
    expect(alert.props.severity).toBe('info')
    expect(alert.props.text).toBe(
      'New: weekend darkroom slots just opened up.'
    )

    expect(result.classes).toEqual([
      {
        id: expect.any(String),
        name: 'hero-panel',
        props: { background: '#1a1a1a', padding: '32' },
      },
    ])
  })
})

describe("applyBql: which field 'that says' fills", () => {
  /**
   * The Properties tab treats a List item's Title as its main text (see
   * PRIMARY_TEXT_FIELD in primary-field.ts), because Icon happening to be
   * declared first is an accident of the schema's order, not a statement
   * about what the block is mostly about. BQL used to pick the first text
   * field outright, so the same sentence filled a different box than the
   * editor would have -- "hello@example.com" landing in Icon, rendering as
   * the literal word next to nothing.
   */
  it('fills the block\'s primary field, not merely its first text one', async () => {
    mockDbal([
      {
        kind: 'add',
        line: 1,
        blockName: 'List Item',
        text: 'hello@example.com',
        attrs: [],
      },
    ])

    const result = await applyBql('irrelevant', 'tenant', 'root', root(), [])

    expect(result.errors).toEqual([])
    const item = result.tree.children[0]
    expect(item.props.title).toBe('hello@example.com')
    expect(item.props.icon).not.toBe('hello@example.com')
  })
})

