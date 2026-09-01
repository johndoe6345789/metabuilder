import type { TestResult } from './use-test-runner'

/** Status pill shown next to each test name -- pending, pass, fail, or a
 *  runtime error, distinguished from a fail because the assertion itself
 *  never ran. */
export function badge(r: TestResult | undefined) {
  if (r === undefined) return { cls: '', label: '—' }
  if (r.status === 'pass') return { cls: 'pass', label: '✓ Pass' }
  if (r.status === 'fail') return { cls: 'fail', label: '✕ Fail' }
  return { cls: 'err', label: '⚠ Error' }
}
