import { useCallback } from 'react'
import { toast } from 'sonner'
import { Action, JSONUIContext } from '@/types/json-ui'
import { evaluateExpression, evaluateTemplate } from '@/lib/json-ui/expression-evaluator'
import { getNestedValue } from '@/lib/json-ui/utils'

export function useActionExecutor(context: JSONUIContext) {
  const { data, updateData, updatePath, executeAction: contextExecute } = context

  const getTargetParts = (target?: string) => {
    if (!target) return null
    const [sourceId, ...pathParts] = target.split('.')
    const path = pathParts.join('.')
    return { sourceId, path: path || undefined }
  }

  const executeAction = useCallback(async (action: Action, event?: any) => {
    try {
      const evaluationContext = { data, event }
      const updateByPath = (sourceId: string, path: string, value: any) => {
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
          current[key] = typeof current[key] === 'object' && current[key] !== null ? { ...current[key] } : {}
          current = current[key]
        }

        current[pathParts[pathParts.length - 1]] = value
        updateData(sourceId, newData)
      }

      const resolveDialogTarget = () => {
        const defaultSourceId = 'uiState'
        const hasExplicitTarget = Boolean(action.target && action.path)
        const sourceId = hasExplicitTarget ? action.target : defaultSourceId
        const dialogId = action.path ?? action.target

        if (!dialogId) return null

        const dialogPath = dialogId.startsWith('dialogs.') ? dialogId : `dialogs.${dialogId}`
        return { sourceId, dialogPath }
      }

      switch (action.type) {
        case 'create': {
          if (!action.target) return
          const currentData = data[action.target] || []
          
          let newValue
          if (action.expression) {
            // New: JSON expression
            newValue = evaluateExpression(action.expression, evaluationContext)
          } else if (action.valueTemplate) {
            // New: JSON template with dynamic values
            newValue = evaluateTemplate(action.valueTemplate, evaluationContext)
          } else {
            // Fallback: static value
            newValue = action.value
          }
          
          updateData(action.target, [...currentData, newValue])
          break
        }

        case 'update': {
          const targetParts = getTargetParts(action.target)
          if (!targetParts) return
          
          let newValue
          if (action.expression) {
            newValue = evaluateExpression(action.expression, evaluationContext)
          } else if (action.valueTemplate) {
            newValue = evaluateTemplate(action.valueTemplate, evaluationContext)
          } else {
            newValue = action.value
          }

          if (targetParts.path) {
            updatePath(targetParts.sourceId, targetParts.path, newValue)
          } else {
            updateData(targetParts.sourceId, newValue)
          }
          break
        }

        case 'delete': {
          if (!action.target) return
          const currentData = data[action.target] || []
          
          let selectorValue
          if (action.expression) {
            selectorValue = evaluateExpression(action.expression, evaluationContext)
          } else if (action.valueTemplate) {
            selectorValue = evaluateTemplate(action.valueTemplate, evaluationContext)
          } else {
            selectorValue = action.value
          }

          if (selectorValue === undefined) return

          const filtered = currentData.filter((item: any) => {
            if (action.path) {
              return getNestedValue(item, action.path) !== selectorValue
            }
            return item !== selectorValue
          })
          updateData(action.target, filtered)
          break
        }

        case 'set-value': {
          const targetParts = getTargetParts(action.target)
          if (!targetParts) return
          
          let newValue
          if (action.expression) {
            newValue = evaluateExpression(action.expression, evaluationContext)
          } else if (action.valueTemplate) {
            newValue = evaluateTemplate(action.valueTemplate, evaluationContext)
          } else {
            newValue = action.value
          }

          if (targetParts.path) {
            updatePath(targetParts.sourceId, targetParts.path, newValue)
          } else {
            updateData(targetParts.sourceId, newValue)
          }
          break
        }

        case 'toggle-value': {
          const targetParts = getTargetParts(action.target)
          if (!targetParts) return

          const currentValue = targetParts.path
            ? getNestedValue(data[targetParts.sourceId], targetParts.path)
            : data[targetParts.sourceId]
          const nextValue = !currentValue

          if (targetParts.path) {
            updatePath(targetParts.sourceId, targetParts.path, nextValue)
          } else {
            updateData(targetParts.sourceId, nextValue)
          }
          break
        }

        case 'increment': {
          const targetParts = getTargetParts(action.target)
          if (!targetParts) return

          const currentValue = targetParts.path
            ? getNestedValue(data[targetParts.sourceId], targetParts.path)
            : data[targetParts.sourceId]
          const amount = action.value || 1
          const nextValue = (currentValue || 0) + amount

          if (targetParts.path) {
            updatePath(targetParts.sourceId, targetParts.path, nextValue)
          } else {
            updateData(targetParts.sourceId, nextValue)
          }
          break
        }

        case 'decrement': {
          const targetParts = getTargetParts(action.target)
          if (!targetParts) return

          const currentValue = targetParts.path
            ? getNestedValue(data[targetParts.sourceId], targetParts.path)
            : data[targetParts.sourceId]
          const amount = action.value || 1
          const nextValue = (currentValue || 0) - amount

          if (targetParts.path) {
            updatePath(targetParts.sourceId, targetParts.path, nextValue)
          } else {
            updateData(targetParts.sourceId, nextValue)
          }
          break
        }

        case 'show-toast': {
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
          break
        }

        case 'navigate': {
          if (action.path) {
            window.location.hash = action.path
          }
          break
        }

        case 'open-dialog': {
          const dialogTarget = resolveDialogTarget()
          if (!dialogTarget) return
          updateByPath(dialogTarget.sourceId, dialogTarget.dialogPath, true)
          break
        }

        case 'close-dialog': {
          const dialogTarget = resolveDialogTarget()
          if (!dialogTarget) return
          updateByPath(dialogTarget.sourceId, dialogTarget.dialogPath, false)
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
  }, [data, updateData, updatePath, contextExecute])

  const executeActions = useCallback(async (actions: Action[], event?: any) => {
    for (const action of actions) {
      await executeAction(action, event)
    }
  }, [executeAction])

  return {
    executeAction,
    executeActions,
  }
}
