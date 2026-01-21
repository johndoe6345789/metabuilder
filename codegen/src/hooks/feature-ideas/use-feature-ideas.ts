import { useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import seedData from '@/data/feature-idea-cloud.json'

export interface FeatureIdea {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'idea' | 'planned' | 'in-progress' | 'completed'
  createdAt: number
  parentGroup?: string
}

type SeedIdea = Omit<FeatureIdea, 'createdAt'> & { createdAtOffset: number }

const buildSeedIdeas = (): FeatureIdea[] => {
  const now = Date.now()
  return (seedData.ideas as SeedIdea[]).map((idea) => ({
    ...idea,
    createdAt: now + idea.createdAtOffset,
  }))
}

const SEED_IDEAS = buildSeedIdeas()

export function useFeatureIdeas() {
  const [ideas, setIdeas] = useKV<FeatureIdea[]>('feature-ideas', SEED_IDEAS)

  const addIdea = useCallback((idea: FeatureIdea) => {
    setIdeas((current) => [...(current || []), idea])
  }, [setIdeas])

  const updateIdea = useCallback((id: string, updates: Partial<FeatureIdea>) => {
    setIdeas((current) => 
      (current || []).map(idea => 
        idea.id === id ? { ...idea, ...updates } : idea
      )
    )
  }, [setIdeas])

  const deleteIdea = useCallback((id: string) => {
    setIdeas((current) => (current || []).filter(idea => idea.id !== id))
  }, [setIdeas])

  const saveIdea = useCallback((idea: FeatureIdea) => {
    setIdeas((current) => {
      const existing = (current || []).find(i => i.id === idea.id)
      if (existing) {
        return (current || []).map(i => i.id === idea.id ? idea : i)
      } else {
        return [...(current || []), idea]
      }
    })
  }, [setIdeas])

  return {
    ideas: ideas || SEED_IDEAS,
    addIdea,
    updateIdea,
    deleteIdea,
    saveIdea,
    setIdeas,
  }
}
