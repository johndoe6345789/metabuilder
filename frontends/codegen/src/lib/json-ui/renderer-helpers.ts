/**
 * renderer-helpers.ts
 *
 * Pure utility functions extracted from renderer.tsx to keep
 * each file under 100 LOC.
 */

import type {
  EventHandler,
  JSONEventDefinition,
  JSONEventMap,
  Action,
} from './types'

export const warnedComponentTypes = new Set<string>()
export const warnedLoopIds = new Set<string>()

export function normalizeEventName(eventName: string): string {
  return eventName.startsWith('on') && eventName.length > 2
    ? `${eventName.charAt(2).toLowerCase()}${eventName.slice(3)}`
    : eventName
}

export function getEventPropName(eventName: string): string {
  return eventName.startsWith('on')
    ? eventName
    : `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
}

export function normalizeEventDefinition(
  eventName: string,
  definition: JSONEventDefinition | string
): EventHandler | null {
  if (!definition) return null
  const normalizedEvent = normalizeEventName(eventName)

  if (typeof definition === 'string') {
    return {
      event: normalizedEvent,
      actions: [{ id: definition, type: 'custom' } as Action],
    }
  }

  if (definition.actions && Array.isArray(definition.actions)) {
    const actions = definition.payload
      ? definition.actions.map((action) => ({
          ...action,
          params: action.params ?? definition.payload,
        }))
      : definition.actions
    return {
      event: normalizedEvent,
      actions,
      condition: definition.condition,
    }
  }

  if (definition.action) {
    return {
      event: normalizedEvent,
      actions: [
        {
          id: definition.action,
          type: 'custom',
          params: definition.payload,
        } as Action,
      ],
      condition: definition.condition,
    }
  }

  return null
}

export function collectEventHandlers(
  events: EventHandler[] | JSONEventMap | undefined
): EventHandler[] {
  if (!events) return []

  if (Array.isArray(events)) {
    return events.map((handler) => ({
      ...handler,
      event: normalizeEventName(handler.event),
    }))
  }

  return Object.entries(events as JSONEventMap).flatMap(
    ([eventName, handler]) => {
      if (Array.isArray(handler)) {
        return handler
          .map((entry) => normalizeEventDefinition(eventName, entry))
          .filter(Boolean) as EventHandler[]
      }
      const normalized = normalizeEventDefinition(eventName, handler)
      return normalized ? [normalized] : []
    }
  )
}

/** Strip non-serialisable / non-DOM props before passing to a
 *  native HTML element. Mutates `domProps` in-place. */
export function sanitizeDomProps(
  domProps: Record<string, any>
): void {
  for (const key of Object.keys(domProps)) {
    if (
      /^on[A-Z]/.test(key) &&
      typeof domProps[key] !== 'function'
    ) {
      delete domProps[key]
    }
    if (key === '_if') delete domProps[key]
  }
  if (
    domProps.style &&
    typeof domProps.style !== 'object'
  ) {
    delete domProps.style
  }
}
