import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import type { TestCase } from './use-test-runner'

const store = vi.hoisted(() => ({
  tests: [] as TestCase[],
  workflow: { nodes: [], edges: [] } as unknown,
}))
const engine = vi.hoisted(() => ({ runWorkflow: vi.fn() }))

vi.mock('@/lib/workflow/run-workflow', () => engine)
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setTests') store.tests = action.payload as TestCase[]
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    setTests: (payload: unknown) => ({ type: 'setTests', payload }),
  }
})

import { useTestRunner } from './use-test-runner'

const testCase = (over: Partial<TestCase> = {}): TestCase => ({
  id: 't1',
  name: 'A test',
  input: '{"a":1}',
  expected: '{"a":1}',
  ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  store.tests = []
  engine.runWorkflow.mockReturnValue({ output: { a: 1 }, logs: ['ran'] })
})

describe('managing cases', () => {
  it('starts with whatever the store holds', () => {
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    expect(result.current.cases).toHaveLength(1)
  })

  it('adds a new case with empty JSON on both sides', () => {
    const { result } = renderHook(() => useTestRunner())
    act(() => {
      result.current.create()
    })
    expect(store.tests).toHaveLength(1)
    expect(store.tests[0]).toMatchObject({
      name: 'New test',
      input: '{}',
      expected: '{}',
    })
  })

  it('keeps the cases that were already there', () => {
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    act(() => {
      result.current.create()
    })
    expect(store.tests).toHaveLength(2)
  })

  it('patches only the named case', () => {
    store.tests = [testCase(), testCase({ id: 't2', name: 'Other' })]
    const { result } = renderHook(() => useTestRunner())
    act(() => {
      result.current.update('t1', { name: 'Renamed' })
    })
    expect(store.tests.map(c => c.name)).toEqual(['Renamed', 'Other'])
  })

  it('removes a case', () => {
    store.tests = [testCase(), testCase({ id: 't2' })]
    const { result } = renderHook(() => useTestRunner())
    act(() => {
      result.current.remove('t1')
    })
    expect(store.tests.map(c => c.id)).toEqual(['t2'])
  })
})

describe('running cases', () => {
  it('passes when the output carries the expected keys', async () => {
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('pass')
    expect(result.current.results.t1?.logs).toEqual(['ran'])
  })

  // A subset match: extra keys in the output are not a failure, because a
  // test states what it cares about, not the whole result.
  it('passes when the output carries more than was expected', async () => {
    engine.runWorkflow.mockReturnValue({ output: { a: 1, b: 2 }, logs: [] })
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('pass')
  })

  it('fails when an expected key is missing', async () => {
    engine.runWorkflow.mockReturnValue({ output: { b: 2 }, logs: [] })
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('fail')
    expect(result.current.results.t1?.actual).toEqual({ b: 2 })
  })

  it('fails when an expected value differs', async () => {
    engine.runWorkflow.mockReturnValue({ output: { a: 2 }, logs: [] })
    store.tests = [testCase()]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('fail')
  })

  it('passes an empty expectation against any output', async () => {
    store.tests = [testCase({ expected: '{}' })]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('pass')
  })

  // Bad JSON is the author's mistake, not the workflow's, so it is
  // reported as an error rather than a failing test.
  it.each([
    ['input', { input: '{ not json' }],
    ['expected', { expected: '{ not json' }],
  ])('errors on unparseable %s, without running anything', async (_l, over) => {
    store.tests = [testCase(over)]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1).toEqual({
      status: 'error',
      message: 'Input/expected is not valid JSON',
    })
    expect(engine.runWorkflow).not.toHaveBeenCalled()
  })

  it('treats empty text as empty JSON', async () => {
    store.tests = [testCase({ input: '', expected: '' })]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('pass')
  })

  it('feeds the parsed input to the workflow', async () => {
    store.tests = [testCase({ input: '{"x":9}' })]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(engine.runWorkflow).toHaveBeenCalledWith(store.workflow, { x: 9 })
  })

  it('runs every case and reports each separately', async () => {
    engine.runWorkflow
      .mockReturnValueOnce({ output: { a: 1 }, logs: [] })
      .mockReturnValueOnce({ output: { a: 99 }, logs: [] })
    store.tests = [testCase(), testCase({ id: 't2' })]
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.results.t1?.status).toBe('pass')
    expect(result.current.results.t2?.status).toBe('fail')
  })

  it('is not running once the batch is done', async () => {
    const { result } = renderHook(() => useTestRunner())
    await act(async () => {
      await result.current.runAll()
    })
    expect(result.current.running).toBe(false)
  })
})
