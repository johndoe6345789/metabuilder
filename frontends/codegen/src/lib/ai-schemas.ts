/**
 * Zod validation schemas for AI service responses.
 */
import { z } from 'zod'

const componentNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    props: z.record(z.string(), z.any()),
    children: z.array(componentNodeSchema),
  }),
)

const prismaFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  isRequired: z.boolean(),
  isUnique: z.boolean(),
  isArray: z.boolean(),
  defaultValue: z.string().optional(),
  relation: z.string().optional(),
})

const prismaModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  fields: z.array(prismaFieldSchema),
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
    large: z.number(),
  }),
  spacing: z.number(),
  borderRadius: z.number(),
})

const projectFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
  language: z.string(),
})

export const componentResponseSchema = z.object({
  component: componentNodeSchema,
})
export const prismaModelResponseSchema = z.object({
  model: prismaModelSchema,
})
export const themeResponseSchema = z.object({
  theme: themeSchema,
})
export const suggestFieldsResponseSchema = z.object({
  fields: z.array(z.string()),
})
export const completeAppResponseSchema = z.object({
  files: z.array(projectFileSchema),
  models: z.array(prismaModelSchema),
  theme: themeSchema,
})
