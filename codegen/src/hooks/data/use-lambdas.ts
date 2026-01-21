import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'
import { Lambda } from '@/types/project'

export function useLambdas() {
  const [lambdas, setLambdas] = useKV<Lambda[]>('project-lambdas', [])
  
  const addLambda = useCallback((lambda: Lambda) => {
    setLambdas(current => [...(current || []), lambda])
  }, [setLambdas])
  
  const updateLambda = useCallback((lambdaId: string, updates: Partial<Lambda>) => {
    setLambdas(current =>
      (current || []).map(l => l.id === lambdaId ? { ...l, ...updates } : l)
    )
  }, [setLambdas])
  
  const deleteLambda = useCallback((lambdaId: string) => {
    setLambdas(current => (current || []).filter(l => l.id !== lambdaId))
  }, [setLambdas])
  
  const getLambda = useCallback((lambdaId: string) => {
    return lambdas?.find(l => l.id === lambdaId)
  }, [lambdas])
  
  return {
    lambdas: lambdas || [],
    addLambda,
    updateLambda,
    deleteLambda,
    getLambda,
  }
}
