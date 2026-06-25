/**
 * action-executor-handlers.ts
 *
 * Pure action handler functions extracted from
 * use-action-executor.ts. No React hooks here.
 */

import { toast } from '@/components/ui/sonner'
import { Action, JSONUIContext } from '@/types/json-ui'
import {
  evaluateExpression,
  evaluateTemplate,
} from '@/lib/json-ui/expression-evaluator'
import { getNestedValue } from '@/lib/json-ui/utils'

type DataMap = Record<string, any>
type UpdateData = (sourceId: string, data: any) => void
type UpdatePath = (
  sourceId: string,
  path: string,
  value: any
) => void

export function resolveActionExpression(
  expression: string,
  mergedData: DataMap,
  event?: any
): any {
  let normalized = expression.trim()
  if (
    !normalized.startsWith('data.') &&
    !normalized.startsWith('event.') &&
    !normalized.startsWith('"') &&
    !normalized.startsWith("'") &&
    !/^-?\d/.test(normalized) &&
    normalized !== 'true' &&
    normalized !== 'false' &&
    normalized !== 'null' &&
    normalized !== 'undefined' &&
    normalized !== 'Date.now()'
  ) {
    normalized = `data.${normalized}`
  }
  return evaluateExpression(normalized, {
    data: mergedData,
    event,
  })
}

export function resolveActionValue(
  action: Action,
  mergedData: DataMap,
  event?: any
): any {
  if (action.expression) {
    return resolveActionExpression(
      action.expression,
      mergedData,
      event
    )
  }
  if (action.valueTemplate) {
    return evaluateTemplate(action.valueTemplate, {
      data: mergedData,
      event,
    })
  }
  return action.value
}

export function getTargetParts(
  target?: string
): { sourceId: string; path: string | undefined } | null {
  if (!target) return null
  const [sourceId, ...pathParts] = target.split('.')
  return {
    sourceId,
    path: pathParts.join('.') || undefined,
  }
}

export function updateByPath(
  sourceId: string,
  path: string,
  value: any,
  data: DataMap,
  updateData: UpdateData,
  updatePath?: UpdatePath
): void {
  if (updatePath) {
    updatePath(sourceId, path, value)
    return
  }
  const sourceData = data[sourceId] ?? {}
  const pathParts = path.split('.')
  const newData = { ...sourceData }
  let current: any = newData

  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i]
    current[key] =
      typeof current[key] === 'object' &&
      current[key] !== null
        ? { ...current[key] }
        : {}
    current = current[key]
  }
  current[pathParts[pathParts.length - 1]] = value
  updateData(sourceId, newData)
}

export function resolveDialogTarget(
  action: Action
): {
  sourceId: string
  dialogPath: string
} | null {
  const defaultSourceId = 'uiState'
  const hasExplicitTarget = Boolean(
    action.target && action.path
  )
  const sourceId = (
    hasExplicitTarget ? action.target : defaultSourceId
  ) ?? defaultSourceId
  const dialogId = action.path ?? action.target
  if (!dialogId) return null
  const dialogPath = dialogId.startsWith('dialogs.')
    ? dialogId
    : `dialogs.${dialogId}`
  return { sourceId, dialogPath }
}

export function handleSetValue(
  action: Action,
  mergedData: DataMap,
  event: any,
  data: DataMap,
  updateData: UpdateData,
  updatePath?: UpdatePath
): void {
  const targetParts = getTargetParts(action.target)
  if (!targetParts) return
  const newValue = resolveActionValue(
    action,
    mergedData,
    event
  )
  if (targetParts.path) {
    if (updatePath) {
      updatePath(
        targetParts.sourceId,
        targetParts.path,
        newValue
      )
    }
  } else {
    updateData(targetParts.sourceId, newValue)
  }
}

export function handleToggleValue(
  action: Action,
  data: DataMap,
  updateData: UpdateData,
  updatePath?: UpdatePath
): void {
  const targetParts = getTargetParts(action.target)
  if (!targetParts) return
  const currentValue = targetParts.path
    ? getNestedValue(
        data[targetParts.sourceId],
        targetParts.path
      )
    : data[targetParts.sourceId]
  const nextValue = !currentValue
  if (targetParts.path) {
    if (updatePath) {
      updatePath(
        targetParts.sourceId,
        targetParts.path,
        nextValue
      )
    }
  } else {
    updateData(targetParts.sourceId, nextValue)
  }
}

export function handleDelta(
  action: Action,
  delta: number,
  data: DataMap,
  updateData: UpdateData,
  updatePath?: UpdatePath
): void {
  const targetParts = getTargetParts(action.target)
  if (!targetParts) return
  const currentValue = targetParts.path
    ? getNestedValue(
        data[targetParts.sourceId],
        targetParts.path
      )
    : data[targetParts.sourceId]
  const amount = action.value || 1
  const nextValue = (currentValue || 0) + delta * amount
  if (targetParts.path) {
    if (updatePath) {
      updatePath(
        targetParts.sourceId,
        targetParts.path,
        nextValue
      )
    }
  } else {
    updateData(targetParts.sourceId, nextValue)
  }
}

export function handleShowToast(action: Action): void {
  const message = action.message || 'Action completed'
  const variant = action.variant || 'success'
  switch (variant) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'info':
      toast.info(message)
      break
    case 'warning':
      toast.warning(message)
      break
  }
}
