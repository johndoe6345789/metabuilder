import { Action } from './schema'
import { toast } from 'sonner'

export type ActionContext = {
  navigate: (path: string) => void
  updateData: (key: string, value: any) => void
  getData: (key: string) => any
  customHandlers: Record<string, (payload?: any) => void | Promise<void>>
}

export async function executeAction(
  action: Action,
  context: ActionContext
): Promise<void> {
  try {
    switch (action.type) {
      case 'navigate':
        if (action.target) {
          context.navigate(action.target)
        }
        break

      case 'create':
      case 'update':
        if (action.target && action.payload) {
          const currentData = context.getData(action.target) || []
          const newData = action.type === 'create'
            ? [...currentData, action.payload]
            : currentData.map((item: any) =>
                item.id === action.payload?.id ? { ...item, ...action.payload } : item
              )
          context.updateData(action.target, newData)
        }
        break

      case 'delete':
        if (action.target && action.payload?.id) {
          const currentData = context.getData(action.target) || []
          const filtered = currentData.filter(
            (item: any) => item.id !== action.payload?.id
          )
          context.updateData(action.target, filtered)
        }
        break

      case 'api':
        if (action.payload?.endpoint) {
          const fetchOptions: RequestInit = {
            method: action.payload.method || 'GET',
            headers: action.payload.headers || undefined,
            body: action.payload.body ? JSON.stringify(action.payload.body) : undefined,
          }
          const response = await fetch(action.payload.endpoint, fetchOptions)
          const data = await response.json()
          if (action.target) {
            context.updateData(action.target, data)
          }
        }
        break

      case 'custom':
        if (action.handler && context.customHandlers[action.handler]) {
          await context.customHandlers[action.handler](action.payload)
        }
        break

      case 'transform':
        if (action.handler && action.target) {
          const sourceData = context.getData(action.payload?.source || action.target)
          const transformed = context.customHandlers[action.handler]?.(sourceData)
          context.updateData(action.target, transformed)
        }
        break
    }
  } catch (error) {
    console.error('Action execution failed:', error)
    toast.error(`Failed to execute ${action.type} action`)
  }
}
