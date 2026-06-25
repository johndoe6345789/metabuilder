/**
 * AIService analysis/theme/meta generation methods.
 */
import { ThemeConfig, ProjectFile, DbModel } from '@/types/project'
import { ProtectedLLMService } from './protected-llm-service'
import { llmPrompt } from '@/lib/llm-service'
import { parseAndValidateJson } from './ai-response-parser'
import {
  themeResponseSchema,
  suggestFieldsResponseSchema,
  completeAppResponseSchema,
} from './ai-schemas'

export class AIServiceAnalyze {
  static async generateThemeFromDescription(
    description: string,
  ): Promise<Partial<ThemeConfig> | null> {
    try {
      const prompt =
        llmPrompt`Generate a Material UI theme for: ${description}
Return JSON: { "theme": { "primaryColor": "#...",
  "secondaryColor": "#...", "errorColor": "#...",
  "warningColor": "#...", "successColor": "#...",
  "fontFamily": "...", "fontSize": { "small": 12,
  "medium": 14, "large": 20 },
  "spacing": 8, "borderRadius": 4 } }`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: true, priority: 'low',
          category: 'generate-theme',
        },
      )
      if (!result) return null
      const parsed = parseAndValidateJson(
        result, themeResponseSchema,
        'generate-theme',
        'AI theme response was invalid. Please retry.',
      )
      return parsed ? parsed.theme : null
    } catch (error) {
      console.error('AI theme generation failed:', error)
      return null
    }
  }

  static async suggestFieldsForModel(
    modelName: string,
    existingFields: string[],
  ): Promise<string[] | null> {
    try {
      const existingFieldsStr = existingFields.join(', ')
      const prompt =
        llmPrompt`Suggest 3-5 useful fields for a Prisma model named ${modelName}.
Existing fields: ${existingFieldsStr}
Return JSON: { "fields": ["camelCaseName1", ...] }`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: true, priority: 'low',
          category: 'suggest-fields',
        },
      )
      if (!result) return null
      const parsed = parseAndValidateJson(
        result, suggestFieldsResponseSchema,
        'suggest-fields',
        'AI field suggestions were invalid.',
      )
      return parsed ? parsed.fields : null
    } catch (error) {
      console.error('AI field suggestion failed:', error)
      return null
    }
  }

  static async explainCode(
    code: string,
  ): Promise<string | null> {
    try {
      const prompt =
        llmPrompt`Explain what this code does in simple terms:
${code}
Provide a clear, concise explanation for developers.`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: false, priority: 'low',
          category: 'explain-code', model: 'claude-haiku',
        },
      )
      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code explanation failed:', error)
      return null
    }
  }

  static async generateCompleteApp(
    description: string,
  ): Promise<{
    files: ProjectFile[]
    models: DbModel[]
    theme: Partial<ThemeConfig>
  } | null> {
    try {
      const prompt =
        llmPrompt`Generate a complete Next.js app structure for: ${description}
Return JSON with "files", "models", and "theme" keys.
Create 2-4 essential files. Include Prisma models. Design a cohesive theme.`
      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        {
          jsonMode: true, priority: 'high',
          category: 'generate-app',
        },
      )
      if (!result) return null
      return parseAndValidateJson(
        result, completeAppResponseSchema,
        'generate-app',
        'AI app generation response was invalid.',
      )
    } catch (error) {
      console.error('AI app generation failed:', error)
      return null
    }
  }
}
