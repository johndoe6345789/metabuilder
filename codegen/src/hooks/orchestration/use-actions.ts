/// <reference path="../../global.d.ts" />

import { useState, useCallback, useMemo } from 'react'
import { PageSchema, ActionConfig } from '@/types/page-schema'
import { toast } from 'sonner'

export function useActions(actions: ActionConfig[] = [], context: Record<string, any> = {}) {
  const [isExecuting, setIsExecuting] = useState(false)
  
  const actionHandlers = useMemo(() => {
    const handlers: Record<string, (params?: any) => Promise<void>> = {}
    
    actions.forEach(action => {
      handlers[action.id] = async (params?: any) => {
        setIsExecuting(true)
        try {
          const mergedParams = { ...action.params, ...params }
          
          switch (action.type) {
            case 'create':
              await handleCreate(mergedParams, context)
              break
            case 'update':
              await handleUpdate(mergedParams, context)
              break
            case 'delete':
              await handleDelete(mergedParams, context)
              break
            case 'navigate':
              await handleNavigate(mergedParams)
              break
            case 'ai-generate':
              await handleAIGenerate(mergedParams, context)
              break
            case 'custom':
              if (action.handler) {
                const customHandler = getCustomHandler(action.handler, context)
                await customHandler(mergedParams)
              }
              break
          }
          
          if (action.onSuccess) {
            const successHandler = handlers[action.onSuccess]
            if (successHandler) await successHandler()
          }
        } catch (error) {
          console.error(`Action ${action.id} failed:`, error)
          toast.error(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          
          if (action.onError) {
            const errorHandler = handlers[action.onError]
            if (errorHandler) await errorHandler({ error })
          }
        } finally {
          setIsExecuting(false)
        }
      }
    })
    
    return handlers
  }, [actions, context])
  
  const execute = useCallback(async (actionId: string, params?: any) => {
    const handler = actionHandlers[actionId]
    if (handler) {
      await handler(params)
    } else {
      console.warn(`Action ${actionId} not found`)
    }
  }, [actionHandlers])
  
  return {
    execute,
    isExecuting,
    handlers: actionHandlers,
  }
}

async function handleCreate(params: any, context: Record<string, any>) {
  const { target, data } = params
  const setter = context[`set${target}`]
  if (setter) {
    setter((current: any[]) => [...current, data])
    toast.success(`${target} created`)
  }
}

async function handleUpdate(params: any, context: Record<string, any>) {
  const { target, id, data } = params
  const setter = context[`set${target}`]
  if (setter) {
    setter((current: any[]) => 
      current.map((item: any) => item.id === id ? { ...item, ...data } : item)
    )
    toast.success(`${target} updated`)
  }
}

async function handleDelete(params: any, context: Record<string, any>) {
  const { target, id } = params
  const setter = context[`set${target}`]
  if (setter) {
    setter((current: any[]) => current.filter((item: any) => item.id !== id))
    toast.success(`${target} deleted`)
  }
}

async function handleNavigate(params: any) {
  const { to, tab } = params
  if (tab) {
    window.location.hash = `#${tab}`
  } else if (to) {
    window.location.href = to
  }
}

async function handleAIGenerate(params: any, context: Record<string, any>) {
  const { prompt, target } = params
  
  const result = await window.spark.llm(prompt)
  
  if (target && context[`set${target}`]) {
    context[`set${target}`](result)
  }
  
  toast.success('AI generation complete')
}

function getCustomHandler(handlerName: string, context: Record<string, any>) {
  return context[handlerName] || (() => {
    console.warn(`Custom handler ${handlerName} not found in context`)
  })
}
