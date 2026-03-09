import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/sonner'
import { llm, llmPrompt } from '@/lib/llm-service'

interface AIGenerationState {
  loading: boolean
  error: string | null
  result: string | null
}

export function useAIGeneration() {
  const [state, setState] = useState<AIGenerationState>({
    loading: false,
    error: null,
    result: null,
  })

  const generate = useCallback(async (
    prompt: string,
    modelName: 'claude-sonnet' | 'claude-haiku' | 'claude-opus' = 'claude-sonnet',
    jsonMode = false
  ) => {
    setState({ loading: true, error: null, result: null })

    try {
      const formattedPrompt = llmPrompt`${prompt}`
      const result = await llm(formattedPrompt, modelName, jsonMode)
      
      setState({ loading: false, error: null, result })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI generation failed'
      setState({ loading: false, error: errorMessage, result: null })
      toast.error(errorMessage)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null })
  }, [])

  return {
    ...state,
    generate,
    reset,
  }
}

export function useAICodeImprovement() {
  const { generate, ...state } = useAIGeneration()

  const improve = useCallback(async (code: string, language: string) => {
    const prompt = `Improve this ${language} code for better readability, performance, and best practices. Return only the improved code without explanations:\n\n${code}`
    return await generate(prompt, 'claude-sonnet')
  }, [generate])

  return {
    ...state,
    improve,
  }
}

export function useAIExplanation() {
  const { generate, ...state } = useAIGeneration()

  const explain = useCallback(async (code: string, language: string) => {
    const prompt = `Explain this ${language} code in simple terms. Break down what it does, how it works, and any important concepts:\n\n${code}`
    return await generate(prompt, 'claude-haiku')
  }, [generate])

  return {
    ...state,
    explain,
  }
}

