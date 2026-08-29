import { describe, expect, it } from 'vitest'

import {
  fillTemplate,
  isTruthy,
  readPath,
  templateValue,
} from './vault-template'

const context = {
  vault: {
    draft: { title: 'GitHub', count: 3, locked: false },
    entries: [{ slug: 'a' }],
    missing: null,
  },
}

describe('readPath', () => {
  it('reads a nested value', () => {
    expect(readPath(context, 'vault.draft.title')).toBe('GitHub')
  })

  it('reads a top-level value', () => {
    expect(readPath(context, 'vault')).toBe(context.vault)
  })

  it.each([
    ['a missing leaf', 'vault.draft.nope'],
    ['a path through a missing branch', 'vault.nope.deeper'],
    ['a path through null', 'vault.missing.deeper'],
    ['a path through a string', 'vault.draft.title.deeper'],
  ])('answers undefined for %s rather than throwing', (_label, path) => {
    expect(readPath(context, path)).toBeUndefined()
  })

  it('reads an array element by index', () => {
    expect(readPath(context, 'vault.entries.0.slug')).toBe('a')
  })
})

describe('templateValue', () => {
  it.each([
    ['a string', 'x', 'x'],
    ['a number', 3, '3'],
    ['zero', 0, '0'],
    ['false', false, 'false'],
  ])('renders %s', (_label, input, expected) => {
    expect(templateValue(input)).toBe(expected)
  })

  it.each([[null], [undefined], [{}], [[1]], [() => 1]])(
    'renders %p as nothing',
    input => {
      // "[object Object]" mid-sentence is worse than a gap.
      expect(templateValue(input)).toBe('')
    }
  )
})

describe('isTruthy', () => {
  it.each([['a'], [1], [true], [{}], [[]]])('accepts %p', value => {
    expect(isTruthy(value)).toBe(true)
  })

  it.each([[undefined], [null], [false], [0], ['']])('rejects %p', value => {
    expect(isTruthy(value)).toBe(false)
  })

  it('accepts an empty object, unlike plain JS falsiness on some values', () => {
    expect(isTruthy({})).toBe(true)
  })
})

describe('fillTemplate', () => {
  it('substitutes a single binding', () => {
    expect(fillTemplate('Hi {{vault.draft.title}}', context)).toBe('Hi GitHub')
  })

  it('substitutes several', () => {
    expect(
      fillTemplate('{{vault.draft.title}} x{{vault.draft.count}}', context)
    ).toBe('GitHub x3')
  })

  it('tolerates whitespace inside the braces', () => {
    expect(fillTemplate('{{ vault.draft.title }}', context)).toBe('GitHub')
  })

  it('drops a binding that does not resolve', () => {
    expect(fillTemplate('a{{vault.nope}}b', context)).toBe('ab')
  })

  it('leaves a string with no bindings alone', () => {
    expect(fillTemplate('plain text', context)).toBe('plain text')
  })

  it('renders false rather than dropping it', () => {
    expect(fillTemplate('{{vault.draft.locked}}', context)).toBe('false')
  })
})
