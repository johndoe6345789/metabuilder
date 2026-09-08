/** What a dry run accumulates as it walks the steps. */

/** The wire shape the daemon sends back and the browser applies. */
export interface DryRunEffect {
  do: string
  target?: unknown
  text?: unknown
  class?: unknown
  path?: unknown
}

export type Row = Record<string, unknown>

export interface DryRunState {
  /** Values steps have named, read back as `${name}`. */
  scope: Record<string, unknown>
  /** Rows this run wrote, per entity. Nothing here reaches the database. */
  rows: Record<string, Row[]>
  /** What the run asked the page to do, in the order it asked. */
  effects: DryRunEffect[]
  logs: string[]
  /** Set when "Only carry on if" stopped the run. */
  stopped: { step: string; because: string } | null
  /** Ids handed out so far, so a dry run repeats exactly. */
  issued: number
  /** The clock this run sees, so a run repeats exactly. */
  now: number
}

export function newDryRunState(
  event: Record<string, unknown>,
  now: number
): DryRunState {
  return {
    scope: { event },
    rows: {},
    effects: [],
    logs: [],
    stopped: null,
    issued: 0,
    now,
  }
}

/**
 * A repeatable id.
 *
 * A real uuid would make every test that touches "Make an id" pass once
 * and fail on the next run, which is worse than not running the step.
 */
export function nextId(state: DryRunState): string {
  state.issued += 1
  return `dry-run-id-${state.issued}`
}

/**
 * Puts a step's results into the scope under the names the founder chose.
 *
 * `outputs` is `{ <result key>: <name to keep it under> }` -- the shape
 * the step's own default config shows, e.g. `{ id: 'new_id' }`.
 */
export function assignOutputs(
  state: DryRunState,
  outputs: unknown,
  result: Record<string, unknown>
): void {
  if (outputs === null || typeof outputs !== 'object') return
  for (const [key, name] of Object.entries(outputs as Row)) {
    if (typeof name === 'string' && name !== '') {
      state.scope[name] = result[key]
    }
  }
}
