import { computeInlineValues } from './snippetInlineValues'
import type { Debugger } from './snippetEditorPanels.types'

function dbgWith(state: Record<string, unknown>): Debugger {
  return { state } as unknown as Debugger
}

const base = {
  currentFile: 'main.py',
  scopes: [{ name: 'Locals', variablesReference: 3, expensive: false }],
  variables: { 3: [{ name: 'x', value: '1', variablesReference: 0 }] },
}

describe('computeInlineValues', () => {
  it('renders top-frame locals on the stopped line', () => {
    const out = computeInlineValues(dbgWith(base), 'main.py', 4)
    expect(out).toEqual([{ line: 4, text: 'x = 1' }])
  })

  it('returns [] when not paused (no current line)', () => {
    expect(computeInlineValues(dbgWith(base), 'main.py', null)).toEqual([])
  })

  it('returns [] when the active file is not the paused file', () => {
    expect(computeInlineValues(dbgWith(base), 'other.py', 4)).toEqual([])
  })

  it('returns [] when the scope has no variables', () => {
    const state = { ...base, variables: {} }
    expect(computeInlineValues(dbgWith(state), 'main.py', 4)).toEqual([])
  })

  it('truncates long values', () => {
    const long = 'y'.repeat(60)
    const state = {
      ...base,
      variables: { 3: [{ name: 'a', value: long, variablesReference: 0 }] },
    }
    const [v] = computeInlineValues(dbgWith(state), 'main.py', 2)
    expect(v.text.endsWith('…')).toBe(true)
    expect(v.text.length).toBeLessThan(long.length)
  })
})
