'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Workflow } from '@/workflow-editor'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'
import { runWorkflow } from '@/lib/workflow/run-workflow'

const KEY = 'god.testCases'
const WF_KEY = 'god.workflow'

export interface TestCase {
  id: string
  name: string
  input: string     // JSON text
  expected: string  // JSON text (subset match)
}

export interface TestResult {
  status: 'pass' | 'fail' | 'error'
  actual?: Record<string, unknown>
  logs?: string[]
  message?: string
}

function seed(): TestCase[] {
  return [{
    id: 't1', name: 'returns email',
    input: '{\n  "email": "a@b.com"\n}',
    expected: '{\n  "email": "a@b.com"\n}',
  }]
}

function subsetMatch(expected: Record<string, unknown>, actual: Record<string, unknown>): boolean {
  return Object.entries(expected).every(([k, v]) =>
    JSON.stringify(actual[k]) === JSON.stringify(v))
}

/** Point-and-click unit tests: run input→expected cases against the workflow. */
export function useTestRunner() {
  const [cases, setCases] = useState<TestCase[]>(seed)
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [running, setRunning] = useState(false)

  useEffect(() => {
    void idbGet<TestCase[]>(KEY).then((c) => { if (c && c.length) setCases(c) })
  }, [])

  const persist = useCallback((next: TestCase[]) => {
    setCases(next); void idbSet(KEY, next)
  }, [])

  const create = useCallback(() => {
    persist([...cases, { id: `t_${Date.now()}`, name: 'New test', input: '{}', expected: '{}' }])
  }, [cases, persist])

  const update = useCallback((id: string, patch: Partial<TestCase>) => {
    persist(cases.map((c) => c.id === id ? { ...c, ...patch } : c))
  }, [cases, persist])

  const remove = useCallback((id: string) => {
    persist(cases.filter((c) => c.id !== id))
  }, [cases, persist])

  const runOne = useCallback(async (tc: TestCase): Promise<TestResult> => {
    let input: Record<string, unknown>
    let expected: Record<string, unknown>
    try {
      input = JSON.parse(tc.input || '{}') as Record<string, unknown>
      expected = JSON.parse(tc.expected || '{}') as Record<string, unknown>
    } catch {
      return { status: 'error', message: 'Input/expected is not valid JSON' }
    }
    const wf = (await idbGet<Workflow>(WF_KEY))
    if (!wf) return { status: 'error', message: 'No workflow to test' }
    const res = runWorkflow(wf, input)
    return {
      status: subsetMatch(expected, res.output) ? 'pass' : 'fail',
      actual: res.output, logs: res.logs,
    }
  }, [])

  const runAll = useCallback(async () => {
    setRunning(true)
    const out: Record<string, TestResult> = {}
    for (const tc of cases) out[tc.id] = await runOne(tc)
    setResults(out); setRunning(false)
  }, [cases, runOne])

  return { cases, results, running, create, update, remove, runAll }
}
