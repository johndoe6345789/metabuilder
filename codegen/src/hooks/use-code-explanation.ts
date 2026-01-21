import { useState } from 'react'
import { useAIOperations } from './use-ai-operations'

export function useCodeExplanation() {
  const [explanation, setExplanation] = useState('')
  const [isExplaining, setIsExplaining] = useState(false)
  const { explainCode } = useAIOperations()

  const explain = async (code: string) => {
    try {
      setIsExplaining(true)
      setExplanation('Analyzing code...')
      const result = await explainCode(code)
      setExplanation(result)
    } finally {
      setIsExplaining(false)
    }
  }

  const reset = () => {
    setExplanation('')
    setIsExplaining(false)
  }

  return {
    explanation,
    isExplaining,
    explain,
    reset,
  }
}
