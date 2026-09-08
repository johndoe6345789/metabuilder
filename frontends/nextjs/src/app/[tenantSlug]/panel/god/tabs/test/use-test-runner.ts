'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTests, type GodState } from '@/store/slices/god-slice'
import { runWorkflow } from '@/lib/workflow/run-workflow'

export interface TestCase {
  id: string
  name: string
  input: string // JSON text
  expected: string // JSON text (subset match)
}

export interface TestResult {
  status: 'pass' | 'fail' | 'error'
  actual?: Record<string, unknown>
  logs?: string[]
  message?: string
  /** What the run asked the page to do. */
  effects?: { do: string }[]
  /** The rows it would have written, per entity. Nothing was written. */
  rows?: Record<string, Record<string, unknown>[]>
  /** Set when "Only carry on if" ended the run early. */
  stopped?: { step: string; because: string } | null
}

function subsetMatch(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): boolean {
  return Object.entries(expected).every(
    ([k, v]) => JSON.stringify(actual[k]) === JSON.stringify(v)
  )
}

import { useGodWorkflow } from '../workflow/use-god-workflow'

/** Point-and-click unit tests run against the workflow currently open. */
export function useTestRunner() {
  const dispatch = useAppDispatch()
  const cases = useAppSelector(s => (s.god as GodState).tests)
  // The one being edited. A tenant may have several now, and a test runs
  // against whichever is open, which is what someone pressing Run means.
  const { workflow } = useGodWorkflow()
  // Partial, not Record: only run cases have a result.
  const [results, setResults] = useState<Partial<Record<string, TestResult>>>(
    {}
  )
  const [running, setRunning] = useState(false)

  const persist = useCallback(
    (next: TestCase[]) => {
      dispatch(setTests(next))
    },
    [dispatch]
  )

  const create = useCallback(() => {
    persist([
      ...cases,
      { id: `t_${Date.now()}`, name: 'New test', input: '{}', expected: '{}' },
    ])
  }, [cases, persist])

  const update = useCallback(
    (id: string, patch: Partial<TestCase>) => {
      persist(cases.map(c => (c.id === id ? { ...c, ...patch } : c)))
    },
    [cases, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(cases.filter(c => c.id !== id))
    },
    [cases, persist]
  )

  const runOne = useCallback(
    (tc: TestCase): TestResult => {
      let input: Record<string, unknown>
      let expected: Record<string, unknown>
      try {
        input = JSON.parse(
          tc.input.length > 0 ? tc.input : '{}'
        ) as Record<string, unknown>
        expected = JSON.parse(
          tc.expected.length > 0 ? tc.expected : '{}'
        ) as Record<string, unknown>
      } catch {
        return { status: 'error', message: 'Input/expected is not valid JSON' }
      }
      const res = runWorkflow(workflow, input)
      return {
        status: subsetMatch(expected, res.output) ? 'pass' : 'fail',
        actual: res.output,
        logs: res.logs,
        effects: res.effects,
        rows: res.rows,
        stopped: res.stopped,
      }
    },
    [workflow]
  )

  const runAll = useCallback(() => {
    setRunning(true)
    const out: Record<string, TestResult> = {}
    for (const tc of cases) out[tc.id] = runOne(tc)
    setResults(out)
    setRunning(false)
  }, [cases, runOne])

  return { cases, results, running, create, update, remove, runAll }
}
