import { useState } from 'react'
import { AIService } from '@/lib/ai-service'
import { toast } from 'sonner'
import { ProjectFile, PrismaModel, ThemeConfig } from '@/types/project'

export function useAIOperations() {
  const [isProcessing, setIsProcessing] = useState(false)

  const improveCode = async (content: string, instruction: string) => {
    try {
      setIsProcessing(true)
      toast.info('Improving code with AI...')
      const improvedCode = await AIService.improveCode(content, instruction)
      
      if (improvedCode) {
        toast.success('Code improved successfully!')
        return improvedCode
      } else {
        toast.error('AI improvement failed. Please try again.')
        return null
      }
    } catch (error) {
      toast.error('Failed to improve code')
      console.error(error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const explainCode = async (content: string) => {
    try {
      setIsProcessing(true)
      const codeExplanation = await AIService.explainCode(content)
      return codeExplanation || 'Failed to generate explanation. Please try again.'
    } catch (error) {
      console.error(error)
      return 'Error generating explanation.'
    } finally {
      setIsProcessing(false)
    }
  }

  const generateCompleteApp = async (description: string) => {
    try {
      setIsProcessing(true)
      toast.info('Generating application with AI...')
      
      const result = await AIService.generateCompleteApp(description)
      
      if (result) {
        toast.success('Application generated successfully!')
        return result
      } else {
        toast.error('AI generation failed. Please try again.')
        return null
      }
    } catch (error) {
      toast.error('AI generation failed')
      console.error(error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    improveCode,
    explainCode,
    generateCompleteApp,
  }
}
