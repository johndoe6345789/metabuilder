/** Resolving one binding from vault-view.json against the live controller. */

import type { VaultBinding } from './vault-view'
import { resolveEvent } from './vault-events'
import type { Context } from './vault-context'
import {
  fillTemplate,
  isTruthy,
  readPath,
} from './vault-template'
import s from './page.module.scss'

export function evaluate(
  binding: string | boolean | VaultBinding,
  context: Context
): unknown {
  if (typeof binding !== 'object') return binding
  if ('$path' in binding) return readPath(context, binding.$path)
  if ('$template' in binding) return fillTemplate(binding.$template, context)
  if ('$eq' in binding) {
    return (
      evaluate(binding.$eq[0], context) === evaluate(binding.$eq[1], context)
    )
  }
  if ('$not' in binding) return !isTruthy(evaluate(binding.$not, context))
  if ('$or' in binding) {
    return binding.$or.some(value => isTruthy(evaluate(value, context)))
  }
  if ('$and' in binding) {
    return binding.$and.every(value => isTruthy(evaluate(value, context)))
  }
  if ('$if' in binding) {
    return isTruthy(evaluate(binding.$if.condition, context))
      ? evaluate(binding.$if.then, context)
      : evaluate(binding.$if.else, context)
  }
  if ('$classes' in binding) {
    return binding.$classes
      .flatMap(value => {
        if (typeof value === 'string') return s[value] ?? []
        return evaluate(value.when, context) === true
          ? (s[value.name] ?? [])
          : []
      })
      .join(' ')
  }
  const reference =
    typeof binding.$event === 'string'
      ? binding.$event
      : evaluate(binding.$event, context)
  if (typeof reference !== 'string')
    throw new Error('Event reference must resolve to a string')
  const handler = resolveEvent(context, reference)
  const args = binding.$args?.map(argument => evaluate(argument, context)) ?? []
  return binding.$value === 'target.value'
    ? (event: { target: { value: string } }) =>
        handler(...args, event.target.value)
    : () => handler(...args)
}
