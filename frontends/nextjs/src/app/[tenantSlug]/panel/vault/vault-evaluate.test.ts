import { beforeEach, describe, expect, it, vi } from 'vitest'

const events = vi.hoisted(() => ({ resolveEvent: vi.fn() }))
vi.mock('./vault-events', () => events)
vi.mock('./page.module.scss', () => ({
  default: { active: 'css-active', muted: 'css-muted' },
}))

import { evaluate } from './vault-evaluate'

const context = {
  vault: {
    draft: { title: 'GitHub', count: 3, locked: false, empty: '' },
    authenticated: true,
  },
} as never

const run = (binding: unknown) => evaluate(binding as never, context)

describe('evaluate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    events.resolveEvent.mockReturnValue(vi.fn())
  })

  describe('literals', () => {
    it.each([['a string', 'plain'], ['true', true], ['false', false]])(
      'passes %s straight through',
      (_label, value) => {
        expect(run(value)).toBe(value)
      }
    )
  })

  describe('$path', () => {
    it('reads a value from the context', () => {
      expect(run({ $path: 'vault.draft.title' })).toBe('GitHub')
    })

    it('answers undefined for a path that does not resolve', () => {
      expect(run({ $path: 'vault.nope.deeper' })).toBeUndefined()
    })
  })

  describe('$template', () => {
    it('substitutes bindings into text', () => {
      expect(run({ $template: 'Hi {{vault.draft.title}}' })).toBe('Hi GitHub')
    })
  })

  describe('$eq', () => {
    it('compares two resolved values', () => {
      expect(
        run({ $eq: [{ $path: 'vault.draft.title' }, 'GitHub'] })
      ).toBe(true)
    })

    it('is false when they differ', () => {
      expect(run({ $eq: [{ $path: 'vault.draft.title' }, 'other'] })).toBe(
        false
      )
    })

    it('compares by identity, not coercion', () => {
      // '3' == 3 in JS; the view language must not inherit that.
      expect(run({ $eq: [{ $path: 'vault.draft.count' }, '3'] })).toBe(false)
    })
  })

  describe('$not', () => {
    it('inverts a truthy value', () => {
      expect(run({ $not: { $path: 'vault.authenticated' } })).toBe(false)
    })

    it('inverts a falsy one', () => {
      expect(run({ $not: { $path: 'vault.draft.empty' } })).toBe(true)
    })
  })

  describe('$or and $and', () => {
    const yes = { $path: 'vault.authenticated' }
    const no = { $path: 'vault.draft.empty' }

    it('$or is true when any branch is', () => {
      expect(run({ $or: [no, yes] })).toBe(true)
    })

    it('$or is false when none is', () => {
      expect(run({ $or: [no, no] })).toBe(false)
    })

    it('$and is true only when all are', () => {
      expect(run({ $and: [yes, yes] })).toBe(true)
      expect(run({ $and: [yes, no] })).toBe(false)
    })

    it('$and on an empty list is true, matching every()', () => {
      expect(run({ $and: [] })).toBe(true)
    })

    it('$or on an empty list is false, matching some()', () => {
      expect(run({ $or: [] })).toBe(false)
    })
  })

  describe('$if', () => {
    it('takes the then branch when the condition holds', () => {
      expect(
        run({
          $if: { condition: { $path: 'vault.authenticated' }, then: 'Y', else: 'N' },
        })
      ).toBe('Y')
    })

    it('takes the else branch when it does not', () => {
      expect(
        run({
          $if: { condition: { $path: 'vault.draft.empty' }, then: 'Y', else: 'N' },
        })
      ).toBe('N')
    })
  })

  describe('$classes', () => {
    it('maps names through the stylesheet', () => {
      expect(run({ $classes: ['active'] })).toBe('css-active')
    })

    it('joins several', () => {
      expect(run({ $classes: ['active', 'muted'] })).toBe(
        'css-active css-muted'
      )
    })

    it('drops a name the stylesheet does not have', () => {
      // A missing class must not emit "undefined" into the class attribute.
      expect(run({ $classes: ['active', 'nope'] })).toBe('css-active')
    })

    it('includes a conditional class only when its test is true', () => {
      expect(
        run({
          $classes: [{ name: 'active', when: { $path: 'vault.authenticated' } }],
        })
      ).toBe('css-active')
    })

    it('omits a conditional class when its test is not exactly true', () => {
      expect(
        run({
          $classes: [{ name: 'active', when: { $path: 'vault.draft.title' } }],
        })
      ).toBe('')
    })
  })

  describe('$event', () => {
    it('resolves a named handler', () => {
      const handler = vi.fn()
      events.resolveEvent.mockReturnValue(handler)

      const fn = run({ $event: 'save' }) as () => void
      fn()

      expect(events.resolveEvent).toHaveBeenCalledWith(context, 'save')
      expect(handler).toHaveBeenCalled()
    })

    it('passes declared arguments through', () => {
      const handler = vi.fn()
      events.resolveEvent.mockReturnValue(handler)

      const fn = run({ $event: 'copy', $args: ['password'] }) as () => void
      fn()

      expect(handler).toHaveBeenCalledWith('password')
    })

    it('forwards the input value when the binding asks for it', () => {
      const handler = vi.fn()
      events.resolveEvent.mockReturnValue(handler)

      const fn = run({ $event: 'setSearch', $value: 'target.value' }) as (
        e: { target: { value: string } }
      ) => void
      fn({ target: { value: 'typed' } })

      expect(handler).toHaveBeenCalledWith('typed')
    })

    it('throws when the reference does not resolve to a name', () => {
      // A binding that names no handler is a bug in the view JSON, and
      // failing loudly beats rendering a button that does nothing.
      expect(() => run({ $event: { $path: 'vault.draft.count' } })).toThrow(
        'must resolve to a string'
      )
    })
  })
})
