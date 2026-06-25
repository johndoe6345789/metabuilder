/**
 * renderer-props.ts
 *
 * Prop resolution and event-handler application helpers
 * for JSONUIRenderer.
 */
import type { UIComponent } from './types'
import { resolveDataBinding } from './utils'
import {
  evaluateConditionExpression,
} from './expression-helpers'
import { cn } from '@/lib/utils'
import {
  collectEventHandlers,
  getEventPropName,
} from './renderer-helpers'

export function resolveProps(
  component: UIComponent,
  dataMap: Record<string, unknown>,
  ctx: Record<string, unknown>
): Record<string, any> {
  const props: Record<string, any> = {
    ...component.props,
  }

  if (component.bindings) {
    for (const [k, binding] of Object.entries(
      component.bindings as Record<string, any>
    )) {
      props[k] = resolveDataBinding(binding, dataMap, ctx)
    }
  }

  if (component.dataBinding) {
    const bound = resolveDataBinding(
      component.dataBinding,
      dataMap,
      ctx
    )
    if (bound !== undefined) {
      props.value = bound
      props.data = bound
    }
  }

  if (component.className) {
    props.className = cn(props.className, component.className)
  }

  if (component.style) {
    props.style = { ...props.style, ...component.style }
  }

  return props
}

export function applyEventHandlers(
  component: UIComponent,
  props: Record<string, any>,
  dataMap: Record<string, unknown>,
  ctx: Record<string, unknown>,
  onAction?: (actions: any[], event?: any) => void
): void {
  const handlers = collectEventHandlers(
    component.events as any
  )
  handlers.forEach((handler) => {
    const propName = getEventPropName(handler.event)
    props[propName] = (ev?: any) => {
      if (handler.condition) {
        const met = evaluateConditionExpression(
          handler.condition,
          { ...dataMap, ...ctx },
          { label: 'event handler condition' }
        )
        if (!met) return
      }
      const payload =
        typeof ev === 'object' && ev !== null
          ? { ...ev, ...ctx }
          : ev
      onAction?.(handler.actions, payload)
    }
  })
}
