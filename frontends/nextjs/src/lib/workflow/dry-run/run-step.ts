/**
 * One step, actually run.
 *
 * `runWorkflow` used to merge every node's config into the data and move
 * on, dispatching on nothing: "Only carry on if" carried on, "Make an id"
 * made nothing, "Say something" said nothing, and every step behaved
 * identically. A green test therefore proved only that a config object
 * carried the keys the test asked for.
 *
 * Rows go to an in-memory store and page steps are recorded rather than
 * applied, so running a test writes nothing and touches no page.
 */

import { evaluateCondition } from './conditions'
import {
  assignOutputs,
  nextId,
  type DryRunState,
  type Row,
} from './dry-run-state'
import { interpolate, interpolateString } from './interpolate'
import {
  createRow,
  findRow,
  findRows,
  removeRow,
  updateRow,
} from './row-store'

/** True when the step type is one this runs; false leaves it to the caller. */
export function isRunnableStep(type: string): boolean {
  return type.startsWith('dbal.') || type.startsWith('page.')
}

const num = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function pageEffect(state: DryRunState, type: string, cfg: Row): void {
  state.effects.push({
    do: type,
    ...(cfg.target === undefined ? {} : { target: cfg.target }),
    ...(cfg.text === undefined ? {} : { text: cfg.text }),
    ...(cfg.class === undefined ? {} : { class: cfg.class }),
    ...(cfg.path === undefined ? {} : { path: cfg.path }),
  })
}

function runRowStep(
  state: DryRunState,
  type: string,
  cfg: Row
): void {
  const entity = interpolateString(cfg.entity, state.scope)
  const data = (interpolate(cfg.data, state.scope) ?? {}) as Row
  const id = interpolate(cfg.id, state.scope)
  const filter = interpolate(cfg.filter, state.scope)
  switch (type) {
    case 'dbal.entity.create': {
      const row = createRow(state, entity, data, nextId(state))
      assignOutputs(state, cfg.outputs, { item: row, id: row.id })
      state.logs.push(`wrote a ${entity} (${String(row.id)})`)
      return
    }
    case 'dbal.entity.get':
      assignOutputs(state, cfg.outputs, {
        item: findRow(state, entity, id),
      })
      return
    case 'dbal.entity.list':
      assignOutputs(state, cfg.outputs, {
        items: findRows(state, entity, filter, num(cfg.limit, 50)),
      })
      return
    case 'dbal.entity.update': {
      const row = updateRow(state, entity, id, data)
      assignOutputs(state, cfg.outputs, { item: row })
      state.logs.push(
        row === null
          ? `no ${entity} with id ${String(id)} to change`
          : `changed a ${entity} (${String(id)})`
      )
      return
    }
    case 'dbal.entity.remove':
      state.logs.push(
        removeRow(state, entity, id)
          ? `removed a ${entity} (${String(id)})`
          : `no ${entity} with id ${String(id)} to remove`
      )
      return
    default:
      assignOutputs(state, cfg.outputs, {
        count: findRows(state, entity, filter, 0).length,
      })
  }
}

/** Runs one step against the state. Returns false when the run must stop. */
export function runStep(
  state: DryRunState,
  type: string,
  config: Row,
  name: string
): boolean {
  if (type.startsWith('page.')) {
    pageEffect(state, type, interpolate(config, state.scope) as Row)
    return true
  }
  switch (type) {
    case 'dbal.uuid':
      assignOutputs(state, config.outputs, { id: nextId(state) })
      return true
    case 'dbal.timestamp':
      assignOutputs(state, config.outputs, { ts: state.now })
      return true
    case 'dbal.var.set': {
      const key = interpolateString(config.name, state.scope)
      if (key !== '') {
        state.scope[key] = interpolate(config.value, state.scope)
      }
      return true
    }
    case 'dbal.log':
      state.logs.push(interpolateString(config.message, state.scope))
      return true
    case 'dbal.stop.unless': {
      const outcome = evaluateCondition(
        interpolate(config.value, state.scope),
        interpolateString(config.is, state.scope),
        interpolate(config.other, state.scope)
      )
      if (!outcome.holds) {
        state.stopped = { step: name, because: outcome.because }
      }
      return outcome.holds
    }
    default:
      runRowStep(state, type, config)
      return true
  }
}
