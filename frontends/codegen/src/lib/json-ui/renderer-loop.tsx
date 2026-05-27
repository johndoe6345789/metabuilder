/**
 * renderer-loop.tsx — loop rendering for JSONUIRenderer.
 */
import React from 'react'
import { resolveDataBinding } from './utils'
import { evaluateConditionExpression } from
  './expression-helpers'
import { MAX_LOOP_ITERATIONS } from './constants'
import { warnedLoopIds } from './renderer-helpers'
import {
  resolveProps, applyEventHandlers,
} from './renderer-props'
import type { LoopRenderArgs } from './renderer-types'
import { resolveLoopCondition } from './renderer-loop-cond'

function resolveLoopItemContent(
  component: any,
  dataMap: Record<string, unknown>,
  loopCtx: Record<string, unknown>,
  renderChildren: LoopRenderArgs['renderChildren'],
  renderBranch: LoopRenderArgs['renderBranch'],
): React.ReactNode {
  let content: React.ReactNode =
    renderChildren(component.children, loopCtx)
  if (!component.conditional) return content
  const met = evaluateConditionExpression(
    component.conditional.if,
    { ...dataMap, ...loopCtx },
    { label: `loop cond (${component.id})` },
  )
  if (met && component.conditional.then !== undefined) {
    content = renderBranch(
      component.conditional.then as any, loopCtx,
    )
  } else if (!met) {
    content = component.conditional.else !== undefined
      ? renderBranch(
          component.conditional.else as any, loopCtx,
        )
      : null
  }
  return content
}

export function renderLoop(
  args: LoopRenderArgs,
): React.ReactNode {
  const {
    component, dataMap, context, getComponent, onAction,
    renderChildren, renderBranch, renderElement,
    missingComponent,
  } = args

  if (!resolveLoopCondition(component, dataMap, context)) {
    return null
  }

  const rawItems =
    (resolveDataBinding(
      component.loop!.source, dataMap, context,
    ) as any[]) || []

  const over = rawItems.length > MAX_LOOP_ITERATIONS
  if (over && !warnedLoopIds.has(component.id)) {
    warnedLoopIds.add(component.id)
    console.warn(`Loop "${component.id}" has ` +
      `${rawItems.length} items, capped to ${MAX_LOOP_ITERATIONS}`)
  }
  const items = over
    ? rawItems.slice(0, MAX_LOOP_ITERATIONS)
    : rawItems

  const Component = getComponent(component.type)
  if (!Component) return missingComponent(component.type)

  const cProps = resolveProps(component, dataMap, context)
  applyEventHandlers(
    component, cProps, dataMap, context, onAction,
  )

  const children = items.map((item: any, i: number) => {
    const loopCtx = {
      ...context,
      [component.loop!.itemVar]: item,
      ...(component.loop!.indexVar
        ? { [component.loop!.indexVar]: i }
        : {}),
    }
    return (
      <React.Fragment key={`${component.id}-${i}`}>
        {resolveLoopItemContent(
          component, dataMap, loopCtx,
          renderChildren, renderBranch,
        )}
      </React.Fragment>
    )
  })

  return renderElement(Component, cProps, children)
}
