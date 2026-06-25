import { useCallback } from 'react'
import { toast } from '@/components/ui/sonner'
import { Action, JSONUIContext } from '@/types/json-ui'
import { getNestedValue } from '@/lib/json-ui/utils'
import {
  resolveActionValue,
  getTargetParts,
  updateByPath,
  resolveDialogTarget,
  handleSetValue,
  handleToggleValue,
  handleDelta,
  handleShowToast,
} from './action-executor-handlers'

export function useActionExecutor(
  context: JSONUIContext
) {
  const {
    data,
    updateData,
    updatePath,
    executeAction: contextExecute,
  } = context

  const executeAction = useCallback(
    async (action: Action, event?: any) => {
      try {
        const eventContext =
          event && typeof event === 'object'
            ? event
            : {}
        const mergedData = { ...data, ...eventContext }

        switch (action.type) {
          case 'create': {
            if (!action.target) return
            const current = data[action.target] || []
            const newValue = resolveActionValue(
              action,
              mergedData,
              event
            )
            updateData(action.target, [
              ...current,
              newValue,
            ])
            break
          }

          case 'update':
          case 'set-value': {
            handleSetValue(
              action,
              mergedData,
              event,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'delete': {
            if (!action.target) return
            const current = data[action.target] || []
            const selectorValue = resolveActionValue(
              action,
              mergedData,
              event
            )
            if (selectorValue === undefined) return
            const filtered = current.filter(
              (item: any) => {
                if (action.path) {
                  return (
                    getNestedValue(item, action.path) !==
                    selectorValue
                  )
                }
                return item !== selectorValue
              }
            )
            updateData(action.target, filtered)
            break
          }

          case 'toggle-value': {
            handleToggleValue(
              action,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'increment': {
            handleDelta(
              action,
              1,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'decrement': {
            handleDelta(
              action,
              -1,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'show-toast': {
            handleShowToast(action)
            break
          }

          case 'navigate': {
            if (action.path) {
              window.location.hash = action.path
            }
            break
          }

          case 'open-dialog': {
            const dt = resolveDialogTarget(action)
            if (!dt) return
            updateByPath(
              dt.sourceId,
              dt.dialogPath,
              true,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'close-dialog': {
            const dt = resolveDialogTarget(action)
            if (!dt) return
            updateByPath(
              dt.sourceId,
              dt.dialogPath,
              false,
              data,
              updateData,
              updatePath
            )
            break
          }

          case 'custom': {
            if (contextExecute) {
              await contextExecute(action, event)
            }
            break
          }
        }
      } catch (error) {
        console.error('Action execution failed:', error)
        toast.error('Action failed')
      }
    },
    [data, updateData, updatePath, contextExecute]
  )

  const executeActions = useCallback(
    async (actions: Action[], event?: any) => {
      for (const action of actions) {
        await executeAction(action, event)
      }
    },
    [executeAction]
  )

  return { executeAction, executeActions }
}
