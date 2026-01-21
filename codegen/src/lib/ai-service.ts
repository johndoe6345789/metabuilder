/// <reference path="../global.d.ts" />

import { PrismaModel, ComponentNode, ThemeConfig, ProjectFile } from '@/types/project'
import { ProtectedLLMService } from './protected-llm-service'
import { toast } from 'sonner'
import { z } from 'zod'

const componentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() => z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  props: z.record(z.any()),
  children: z.array(componentNodeSchema)
}))

const prismaFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  isRequired: z.boolean(),
  isUnique: z.boolean(),
  isArray: z.boolean(),
  defaultValue: z.string().optional(),
  relation: z.string().optional()
})

const prismaModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  fields: z.array(prismaFieldSchema)
})

const themeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  errorColor: z.string(),
  warningColor: z.string(),
  successColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.object({
    small: z.number(),
    medium: z.number(),
    large: z.number()
  }),
  spacing: z.number(),
  borderRadius: z.number()
})

const projectFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
  language: z.string()
})

const componentResponseSchema = z.object({ component: componentNodeSchema })
const prismaModelResponseSchema = z.object({ model: prismaModelSchema })
const themeResponseSchema = z.object({ theme: themeSchema })
const suggestFieldsResponseSchema = z.object({ fields: z.array(z.string()) })
const completeAppResponseSchema = z.object({
  files: z.array(projectFileSchema),
  models: z.array(prismaModelSchema),
  theme: themeSchema
})

const parseAndValidateJson = <T,>(
  result: string,
  schema: z.ZodType<T>,
  context: string,
  toastMessage: string
): T | null => {
  let parsed: unknown

  try {
    parsed = JSON.parse(result)
  } catch (error) {
    console.error('AI response JSON parse failed', {
      context,
      error: error instanceof Error ? error.message : String(error),
      rawResponse: result
    })
    toast.error(toastMessage)
    return null
  }

  const validation = schema.safeParse(parsed)
  if (!validation.success) {
    console.error('AI response validation failed', {
      context,
      issues: validation.error.issues,
      rawResponse: parsed
    })
    toast.error(toastMessage)
    return null
  }

  return validation.data
}

export class AIService {
  static async generateComponent(description: string): Promise<ComponentNode | null> {
    try {
      const prompt = window.spark.llmPrompt`You are a React component generator. Generate a component tree structure based on this description: ${description}

Return a valid JSON object with a single property "component" containing the component structure. The component should follow this format:
{
  "component": {
    "id": "unique-id",
    "type": "Box",
    "name": "ComponentName",
    "props": {
      "sx": { "p": 2 }
    },
    "children": []
  }
}

Make sure to use appropriate Material UI components and props. Keep the structure clean and semantic.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: true, priority: 'medium', category: 'generate-component' }
      )

      if (result) {
        const parsed = parseAndValidateJson(
          result,
          componentResponseSchema,
          'generate-component',
          'AI component response was invalid. Please retry or clarify your description.'
        )
        return parsed ? parsed.component : null
      }
      return null
    } catch (error) {
      console.error('AI component generation failed:', error)
      return null
    }
  }

  static async generatePrismaModel(description: string, existingModels: PrismaModel[]): Promise<PrismaModel | null> {
    try {
      const existingModelNames = existingModels.map(m => m.name).join(', ')

      const prompt = window.spark.llmPrompt`You are a Prisma schema expert. Create a Prisma model based on this description: ${description}

Existing models in the schema: ${existingModelNames || 'none'}

Return a valid JSON object with a single property "model" containing the model structure:
{
  "model": {
    "id": "unique-id-here",
    "name": "ModelName",
    "fields": [
      {
        "id": "field-id-1",
        "name": "id",
        "type": "String",
        "isRequired": true,
        "isUnique": true,
        "isArray": false,
        "defaultValue": "uuid()"
      },
      {
        "id": "field-id-2",
        "name": "fieldName",
        "type": "String",
        "isRequired": true,
        "isUnique": false,
        "isArray": false
      }
    ]
  }
}`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: true, priority: 'medium', category: 'generate-model' }
      )

      if (result) {
        const parsed = parseAndValidateJson(
          result,
          prismaModelResponseSchema,
          'generate-model',
          'AI model response was invalid. Please retry or describe the model differently.'
        )
        return parsed ? parsed.model : null
      }
      return null
    } catch (error) {
      console.error('AI model generation failed:', error)
      return null
    }
  }

  static async generateCodeFromDescription(
    description: string,
    fileType: 'component' | 'page' | 'api' | 'utility'
  ): Promise<string | null> {
    try {
      const fileTypeInstructions = {
        component: "Create a reusable React component with TypeScript. Use Material UI components and proper typing.",
        page: "Create a Next.js page component with 'use client' directive if needed. Use Material UI and proper page structure.",
        api: "Create a Next.js API route handler with proper types and error handling.",
        utility: "Create a utility function with TypeScript types and JSDoc comments."
      }

      const prompt = window.spark.llmPrompt`You are a Next.js developer. ${fileTypeInstructions[fileType]}

Description: ${description}

Generate clean, production-ready code following Next.js 14 and Material UI best practices. Include all necessary imports.

Return ONLY the code without any markdown formatting or explanations.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: false, priority: 'high', category: 'generate-code' }
      )

      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code generation failed:', error)
      return null
    }
  }

  static async improveCode(code: string, instruction: string): Promise<string | null> {
    try {
      const prompt = window.spark.llmPrompt`You are a code improvement assistant. Improve the following code based on this instruction: ${instruction}

Original code:
${code}

Return ONLY the improved code without any markdown formatting or explanations.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: false, priority: 'high', category: 'improve-code' }
      )

      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code improvement failed:', error)
      return null
    }
  }

  static async generateThemeFromDescription(description: string): Promise<Partial<ThemeConfig> | null> {
    try {
      const prompt = window.spark.llmPrompt`You are a UI/UX designer. Generate a Material UI theme configuration based on this description: ${description}

Return a valid JSON object with a single property "theme" containing:
{
  "theme": {
    "primaryColor": "#hex-color",
    "secondaryColor": "#hex-color",
    "errorColor": "#hex-color",
    "warningColor": "#ff9800",
    "successColor": "#hex-color",
    "fontFamily": "font-name, fallback",
    "fontSize": {
      "small": 12,
      "medium": 14,
      "large": 20
    },
    "spacing": 8,
    "borderRadius": 4
  }
}`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: true, priority: 'low', category: 'generate-theme' }
      )

      if (result) {
        const parsed = parseAndValidateJson(
          result,
          themeResponseSchema,
          'generate-theme',
          'AI theme response was invalid. Please retry or specify the theme requirements.'
        )
        return parsed ? parsed.theme : null
      }
      return null
    } catch (error) {
      console.error('AI theme generation failed:', error)
      return null
    }
  }

  static async suggestFieldsForModel(modelName: string, existingFields: string[]): Promise<string[] | null> {
    try {
      const existingFieldsStr = existingFields.join(', ')
      const prompt = window.spark.llmPrompt`You are a database architect. Suggest additional useful fields for a Prisma model named ${modelName}.

Existing fields: ${existingFieldsStr}

Return a valid JSON object with a single property "fields" containing an array of field name suggestions (strings only):
{
  "fields": ["fieldName1", "fieldName2", "fieldName3"]
}

Suggest 3-5 common fields that would be useful for this model type. Use camelCase naming.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: true, priority: 'low', category: 'suggest-fields' }
      )

      if (result) {
        const parsed = parseAndValidateJson(
          result,
          suggestFieldsResponseSchema,
          'suggest-fields',
          'AI field suggestions were invalid. Please retry with a clearer model name.'
        )
        return parsed ? parsed.fields : null
      }
      return null
    } catch (error) {
      console.error('AI field suggestion failed:', error)
      return null
    }
  }

  static async explainCode(code: string): Promise<string | null> {
    try {
      const prompt = window.spark.llmPrompt`You are a code teacher. Explain what this code does in simple terms:
${code}

Provide a clear, concise explanation suitable for developers.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: false, priority: 'low', category: 'explain-code', model: 'gpt-4o-mini' }
      )

      return result ? result.trim() : null
    } catch (error) {
      console.error('AI code explanation failed:', error)
      return null
    }
  }

  static async generateCompleteApp(description: string): Promise<{ files: ProjectFile[], models: PrismaModel[], theme: Partial<ThemeConfig> } | null> {
    try {
      const prompt = window.spark.llmPrompt`You are a full-stack architect. Generate a complete Next.js application structure based on this description: ${description}

Return a valid JSON object with properties "files", "models", and "theme":
{
  "files": [
    {
      "id": "unique-id",
      "name": "page.tsx",
      "path": "/src/app/page.tsx",
      "content": "full code content here",
      "language": "typescript"
    }
  ],
  "models": [
    {
      "id": "unique-id",
      "name": "User",
      "fields": [
        {
          "id": "field-id",
          "name": "id",
          "type": "String",
          "isRequired": true,
          "isUnique": true,
          "isArray": false,
          "defaultValue": "uuid()"
        }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e",
    "errorColor": "#f44336",
    "warningColor": "#ff9800",
    "successColor": "#4caf50",
    "fontFamily": "Roboto, Arial, sans-serif",
    "fontSize": { "small": 12, "medium": 14, "large": 20 },
    "spacing": 8,
    "borderRadius": 4
  }
}

Create 2-4 essential files for the app structure. Include appropriate Prisma models. Design a cohesive theme.`

      const result = await ProtectedLLMService.safeLLMCall(
        prompt,
        { jsonMode: true, priority: 'high', category: 'generate-app' }
      )

      if (result) {
        return parseAndValidateJson(
          result,
          completeAppResponseSchema,
          'generate-app',
          'AI app generation response was invalid. Please retry with more detail.'
        )
      }
      return null
    } catch (error) {
      console.error('AI app generation failed:', error)
      return null
    }
  }
}
