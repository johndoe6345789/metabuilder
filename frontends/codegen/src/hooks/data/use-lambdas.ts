import { useAppDispatch, useAppSelector } from '@/store'
import { addLambda as addLambdaAction, updateLambda as updateLambdaAction, deleteLambda as removeLambda, setLambdas } from '@/store/slices/lambdasSlice'
import { useCallback } from 'react'
import { Lambda } from '@/types/project'

export function useLambdas() {
  const dispatch = useAppDispatch()
  const sliceLambdas = useAppSelector((s) => s.lambdas?.lambdas ?? [])
  const lambdas = sliceLambdas as unknown as Lambda[]
  
  const addLambda = useCallback((lambda: Lambda) => {
    dispatch(addLambdaAction(lambda as any))
  }, [dispatch])
  
  const updateLambda = useCallback((lambdaId: string, updates: Partial<Lambda>) => {
    const existing = lambdas.find(l => l.id === lambdaId)
    if (existing) {
      dispatch(updateLambdaAction({ ...existing, ...updates } as any))
    }
  }, [dispatch, lambdas])
  
  const deleteLambda = useCallback((lambdaId: string) => {
    dispatch(removeLambda(lambdaId))
  }, [dispatch])
  
  const getLambda = useCallback((lambdaId: string) => {
    return lambdas.find(l => l.id === lambdaId)
  }, [lambdas])
  
  return {
    lambdas,
    addLambda,
    updateLambda,
    deleteLambda,
    getLambda,
  }
}
