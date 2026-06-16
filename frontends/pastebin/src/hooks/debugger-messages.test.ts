import { handleDapMessage, type MessageDeps } from './debugger-messages'
import type { InspectDeps } from './debugger-inspection'
import type { DapMessage } from '@/lib/flask-debugger'
import type { DebuggerAction } from './debugger-types'

const msg = (m: Partial<DapMessage>) => m as DapMessage

function makeDeps() {
  const dispatched: DebuggerAction[] = []
  const pending = new Map<number, (m: DapMessage) => void>()
  const deps: MessageDeps = {
    dispatch: a => dispatched.push(a),
    pendingRef: { current: pending },
    onInitRef: { current: null },
    inspectRef: {
      current: {
        dap: (() => Promise.resolve({})) as InspectDeps['dap'],
        dispatch: () => {},
        watchesRef: { current: [] },
      },
    },
  }
  return { deps, dispatched, pending }
}

describe('handleDapMessage', () => {
  it('resolves a pending request by request_seq', () => {
    const { deps, pending } = makeDeps()
    const resolve = jest.fn()
    pending.set(5, resolve)
    handleDapMessage(deps, msg({ type: 'response', request_seq: 5 }))
    expect(resolve).toHaveBeenCalled()
    expect(pending.has(5)).toBe(false)
  })

  it('dispatches PAUSED on a stopped event', () => {
    const { deps, dispatched } = makeDeps()
    handleDapMessage(
      deps,
      msg({ type: 'event', event: 'stopped', body: { threadId: 2 } }),
    )
    expect(dispatched).toContainEqual({
      type: 'PAUSED',
      threadId: 2,
      file: null,
      line: null,
    })
  })

  it('dispatches RUNNING / TERMINATED on continued / exited', () => {
    const { deps, dispatched } = makeDeps()
    handleDapMessage(deps, msg({ type: 'event', event: 'continued' }))
    handleDapMessage(deps, msg({ type: 'event', event: 'exited' }))
    expect(dispatched).toContainEqual({ type: 'RUNNING' })
    expect(dispatched).toContainEqual({ type: 'TERMINATED' })
  })

  it('dispatches OUTPUT for output events', () => {
    const { deps, dispatched } = makeDeps()
    handleDapMessage(
      deps,
      msg({ type: 'event', event: 'output', body: { output: 'hi\n' } }),
    )
    expect(dispatched).toContainEqual({
      type: 'OUTPUT',
      category: 'stdout',
      text: 'hi\n',
    })
  })

  it('runs onInitRef on the initialized event', () => {
    const { deps } = makeDeps()
    const init = jest.fn().mockResolvedValue(undefined)
    deps.onInitRef.current = init
    handleDapMessage(deps, msg({ type: 'event', event: 'initialized' }))
    expect(init).toHaveBeenCalled()
  })
})
