/**
 * AIService code/model/component generation methods.
 */
import { DbModel, ComponentNode } from '@/types/project'
import { ProtectedLLMService } from './protected-llm-service'
import { llmPrompt } from '@/lib/llm-service'
import { parseAndValidateJson } from './ai-response-parser'
import {
  componentResponseSchema,
  prismaModelResponseSchema,
} from './ai-schemas'

export class AIServiceGenerate {
  static async generateComponent(
    description: string,
  ): Promise<ComponentNode | null> {
    try {
      const prompt = llmPrompt`Generate a React component tree for: ${description}

Return JSON: { "component": { "id": "...", "type": "Box", "name": "...", "props": {}, "children": [] } }
Use Material UI components. Keep the structure clean and semantic.`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: true, priority: 'medium',
          category: 'generate-component',
        },
      )
      if (!result) return null
      const parsed = parseAndValidateJson(
        result, componentResponseSchema,
        'generate-component',
        'AI component response was invalid. Please retry.',
      )
      return parsed ? parsed.component : null
    } catch (error) {
      console.error('AI component generation failed:', error)
      return null
    }
  }

  static async generateDbModel(
    description: string,
    existingModels: DbModel[],
  ): Promise<DbModel | null> {
    try {
      const existingModelNames =
        existingModels.map((m) => m.name).join(', ') || 'none'
      const prompt =
        llmPrompt`Create a Prisma model for: ${description}
Existing models: ${existingModelNames}
Return JSON: { "model": { "id": "...", "name": "...", "fields": [...] } }`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: true, priority: 'medium',
          category: 'generate-model',
        },
      )
      if (!result) return null
      const parsed = parseAndValidateJson(
        result, prismaModelResponseSchema,
        'generate-model',
        'AI model response was invalid. Please retry.',
      )
      return parsed ? parsed.model : null
    } catch (error) {
      console.error('AI model generation failed:', error)
      return null
    }
  }

  static async generateCodeFromDescription(
    description: string,
    fileType: 'component' | 'page' | 'api' | 'utility',
  ): Promise<string | null> {
    const instructions: Record<string, string> = {
      component: 'Create a reusable React component with TypeScript.',
      page: 'Create a Next.js page with "use client" if needed.',
      api: 'Create a Next.js API route handler.',
      utility: 'Create a utility function with JSDoc.',
    }
    try {
      const prompt = llmPrompt`${instructions[fileType]}
Description: ${description}
Return ONLY the code without markdown or explanations.`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: false, priority: 'high',
          category: 'generate-code',
        },
      )
      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code generation failed:', error)
      return null
    }
  }

  static async improveCode(
    code: string,
    instruction: string,
  ): Promise<string | null> {
    try {
      const prompt =
        llmPrompt`Improve the following code per this instruction: ${instruction}
Original code:
${code}
Return ONLY the improved code without markdown.`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: false, priority: 'high',
          category: 'improve-code',
        },
      )
      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code improvement failed:', error)
      return null
    }
  }
}
