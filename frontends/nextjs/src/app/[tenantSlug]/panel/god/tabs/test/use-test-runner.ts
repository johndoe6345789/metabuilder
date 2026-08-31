'use client'

import { useCallback, useState } from 'react'
import type { Workflow } from '@/workflow-editor'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTests } from '@/store/slices/god-slice'
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
}

function subsetMatch(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): boolean {
  return Object.entries(expected).every(
    ([k, v]) => JSON.stringify(actual[k]) === JSON.stringify(v)
  )
}

/** Point-and-click unit tests run against the current workflow (from Redux). */
export function useTestRunner() {
  const dispatch = useAppDispatch()
  const cases: TestCase[] = useAppSelector(s => s.god.tests)
  const workflow: Workflow = useAppSelector(s => s.god.workflow)
  const [results, setResults] = useState<Record<string, TestResult>>({})
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
        input = JSON.parse(tc.input || '{}') as Record<string, unknown>
        expected = JSON.parse(tc.expected || '{}') as Record<string, unknown>
      } catch {
        return { status: 'error', message: 'Input/expected is not valid JSON' }
      }
      const res = runWorkflow(workflow, input)
      return {
        status: subsetMatch(expected, res.output) ? 'pass' : 'fail',
        actual: res.output,
        logs: res.logs,
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
