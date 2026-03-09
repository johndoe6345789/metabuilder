import { useState, useCallback } from 'react'

export function useFeatureIdeaCloud() {
  const [ideas, setIdeas] = useState<string[]>([])

  const addIdea = useCallback((idea: string) => {
    setIdeas(prev => [...prev, idea])
  }, [])

  const removeIdea = useCallback((index: number) => {
    setIdeas(prev => prev.filter((_, i) => i !== index))
  }, [])

  return { ideas, addIdea, removeIdea }
}
