import type { SeedResults } from './types'

/**
 * Every seed write follows the same shape: count a success, count a 409
 * as already-there rather than a failure, count and log anything else
 * (including a thrown exception) as an error -- so one write never
 * aborts the rest of the run. Factored out once four call sites in
 * route.ts had each grown their own copy of this try/catch.
 */
export async function trackSeedAttempt(
  results: SeedResults,
  field: 'packages' | 'pages',
  successMessage: string,
  failLabel: string,
  write: () => Promise<{ ok: boolean; status: number }>
): Promise<void> {
  try {
    const res = await write()
    if (res.ok) {
      results[field]++
      console.warn(`[Seed] ${successMessage}`)
    } else if (res.status === 409) {
      results.skipped++
    } else {
      results.errors++
      console.warn(`[Seed] Failed to seed ${failLabel}: HTTP ${res.status}`)
    }
  } catch (error) {
    results.errors++
    console.warn(
      `[Seed] Failed to seed ${failLabel}:`,
      error instanceof Error ? error.message : error
    )
  }
}
