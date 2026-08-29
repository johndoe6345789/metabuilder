import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import type { Task } from './plan-types'

/** A store that really holds the plan, so persistence can be observed. */
const store = vi.hoisted(() => ({ plan: [] as Task[] }))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setPlan') store.plan = action.payload as Task[]
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    setPlan: (payload: unknown) => ({ type: 'setPlan', payload }),
  }
})

import { COLUMNS, usePlanBoard } from './use-plan-board'

const task = (over: Partial<Task> = {}): Task =>
  ({
    id: 't1',
    title: 'Ship it',
    status: 'todo',
    priority: 'medium',
    ...over,
  }) as Task

beforeEach(() => {
  store.plan = []
})

describe('usePlanBoard', () => {
  it('starts with an empty draft for every column', () => {
    const { result } = renderHook(() => usePlanBoard())
    for (const column of COLUMNS) {
      expect(result.current.drafts[column.status]).toBe('')
    }
  })

  it('reads the tasks already in the store', () => {
    store.plan = [task()]
    const { result } = renderHook(() => usePlanBoard())
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0]?.title).toBe('Ship it')
  })

  it('has no tasks when the store holds none', () => {
    const { result } = renderHook(() => usePlanBoard())
    expect(result.current.tasks).toEqual([])
  })

  it('keeps a draft per column', () => {
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.setDraft('todo', 'first')
    })
    expect(result.current.drafts.todo).toBe('first')
    expect(result.current.drafts.done).toBe('')
  })

  it('adds a task from the draft and clears it', () => {
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.setDraft('todo', 'New task')
    })
    act(() => {
      result.current.add('todo')
    })
    expect(store.plan.map(t => t.title)).toEqual(['New task'])
    expect(result.current.drafts.todo).toBe('')
  })

  // An empty draft is not a task; the column keeps its state untouched.
  it.each(['', '   '])('adds nothing for the draft %p', draft => {
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.setDraft('todo', draft)
    })
    act(() => {
      result.current.add('todo')
    })
    expect(store.plan).toEqual([])
  })

  it('trims the title it stores', () => {
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.setDraft('todo', '  padded  ')
    })
    act(() => {
      result.current.add('todo')
    })
    expect(store.plan[0]?.title).toBe('padded')
  })

  it('adds into the column that was asked for', () => {
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.setDraft('done', 'Finished')
    })
    act(() => {
      result.current.add('done')
    })
    expect(store.plan[0]?.status).toBe('done')
  })

  it('moves a task to another column', () => {
    store.plan = [task()]
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.moveTo('t1', 'done')
    })
    expect(store.plan[0]?.status).toBe('done')
  })

  it('updates a task in place', () => {
    store.plan = [task()]
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.update('t1', { title: 'Renamed' })
    })
    expect(store.plan[0]?.title).toBe('Renamed')
  })

  it('removes a task', () => {
    store.plan = [task(), task({ id: 't2' })]
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.remove('t1')
    })
    expect(store.plan.map(t => t.id)).toEqual(['t2'])
  })

  it('removes nothing for an id that is not on the board', () => {
    store.plan = [task()]
    const { result } = renderHook(() => usePlanBoard())
    act(() => {
      result.current.remove('nobody')
    })
    expect(store.plan).toHaveLength(1)
  })

  it('groups the tasks by column', () => {
    store.plan = [task(), task({ id: 't2', status: 'done' })]
    const { result } = renderHook(() => usePlanBoard())
    expect(result.current.byStatus('todo').map(t => t.id)).toEqual(['t1'])
    expect(result.current.byStatus('done').map(t => t.id)).toEqual(['t2'])
  })

  it('gives an empty list for a column with nothing in it', () => {
    const { result } = renderHook(() => usePlanBoard())
    expect(result.current.byStatus('done')).toEqual([])
  })
})
