import { onStopped, fetchVars, evalWatch } from './debugger-inspection'
import type { InspectDeps } from './debugger-inspection'
import type { DebuggerAction } from './debugger-types'

function makeDeps(responses: Record<string, unknown>) {
  const dispatched: DebuggerAction[] = []
  const dap = ((cmd: string) =>
    Promise.resolve(responses[cmd])) as InspectDeps['dap']
  const deps: InspectDeps = {
    dap,
    dispatch: a => dispatched.push(a),
    watchesRef: { current: [] },
  }
  return { deps, dispatched }
}

describe('onStopped', () => {
  it('dispatches call stack, paused line, scopes and variables', async () => {
    const { deps, dispatched } = makeDeps({
      stackTrace: {
        stackFrames: [
          {
            id: 7,
            name: 'main',
            line: 4,
            source: { path: '/workspace/main.py' },
          },
        ],
      },
      scopes: {
        scopes: [{ name: 'Locals', variablesReference: 3, expensive: false }],
      },
      variables: {
        variables: [{ name: 'x', value: '1', variablesReference: 0 }],
      },
    })
    await onStopped(deps, 1)
    const types = dispatched.map(a => a.type)
    expect(types).toEqual(
      expect.arrayContaining(['CALL_STACK', 'PAUSED', 'SCOPES', 'VARIABLES']),
    )
    const paused = dispatched.find(a => a.type === 'PAUSED')
    // filename derived from source.path (debugpy sends no source.name)
    expect(paused).toMatchObject({ file: 'main.py', line: 4 })
  })

  it('skips scopes/variables when there is no frame', async () => {
    const { deps, dispatched } = makeDeps({ stackTrace: { stackFrames: [] } })
    await onStopped(deps, 1)
    expect(dispatched.map(a => a.type)).toEqual(['CALL_STACK'])
  })
})

describe('fetchVars', () => {
  it('dispatches VARIABLES for the ref', async () => {
    const { deps, dispatched } = makeDeps({
      variables: {
        variables: [{ name: 'y', value: '2', variablesReference: 0 }],
      },
    })
    await fetchVars(deps, 5)
    expect(dispatched[0]).toEqual({
      type: 'VARIABLES',
      ref: 5,
      vars: [{ name: 'y', value: '2', variablesReference: 0 }],
    })
  })
})

describe('evalWatch', () => {
  it('dispatches the evaluated value', async () => {
    const { deps, dispatched } = makeDeps({ evaluate: { result: '42' } })
    await evalWatch(deps, 0, 'x')
    expect(dispatched[0]).toEqual({
      type: 'WATCH_RESULT',
      index: 0,
      value: '42',
    })
  })

  it('dispatches an error result on failure', async () => {
    const dispatched: DebuggerAction[] = []
    const deps: InspectDeps = {
      dap: (() => Promise.reject(new Error('boom'))) as InspectDeps['dap'],
      dispatch: a => dispatched.push(a),
      watchesRef: { current: [] },
    }
    await evalWatch(deps, 1, 'x')
    expect(dispatched[0]).toMatchObject({
      type: 'WATCH_RESULT',
      index: 1,
      value: null,
      error: 'boom',
    })
  })
})
