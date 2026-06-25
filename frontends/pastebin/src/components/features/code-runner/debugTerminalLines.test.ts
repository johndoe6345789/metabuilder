import { debugTerminalLines } from './debugTerminalLines'

describe('debugTerminalLines', () => {
  it('maps stdout events to output rows', () => {
    const lines = debugTerminalLines([
      { category: 'stdout', text: 'hello\n' },
    ])
    expect(lines).toEqual([
      { type: 'output', content: 'hello\n', id: 'dbg-0' },
    ])
  })

  it('maps stderr events to error rows', () => {
    const [line] = debugTerminalLines([
      { category: 'stderr', text: 'boom' },
    ])
    expect(line).toMatchObject({ type: 'error', content: 'boom' })
  })

  it('gives each line a stable index-based id', () => {
    const lines = debugTerminalLines([
      { category: 'stdout', text: 'a' },
      { category: 'stdout', text: 'b' },
    ])
    expect(lines.map(l => l.id)).toEqual(['dbg-0', 'dbg-1'])
  })

  it('returns an empty array for no output', () => {
    expect(debugTerminalLines([])).toEqual([])
  })
})
