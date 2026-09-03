'use client'

import type { BqlSentence } from './types'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface BqlSyntaxError {
  line: number
  message: string
}

export type BqlParseResponse =
  | { ok: true; sentences: BqlSentence[] }
  | { ok: false; errors: BqlSyntaxError[] }

/**
 * Calls DBAL's shared BQL syntax parser instead of parsing locally, so the
 * grammar is defined once and any app can reuse it (see the dbal repo's
 * bql_route_handler.hpp). The "core" package segment is unused by the
 * endpoint -- parsing touches no tenant data -- and is there only to match
 * the URL shape DBAL's other non-CRUD utility routes use.
 */
export async function parseBqlViaDbal(
  tenant: string,
  script: string
): Promise<BqlParseResponse> {
  try {
    const res = await fetch(`${DBAL}/${tenant}/core/bql/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script }),
      signal: AbortSignal.timeout(6000),
    })
    return (await res.json()) as BqlParseResponse
  } catch {
    return {
      ok: false,
      errors: [{ line: 0, message: 'Could not reach the BQL parser' }],
    }
  }
}
