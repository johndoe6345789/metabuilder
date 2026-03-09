import { z } from 'zod'

export const ActionSchema = z.object({
  id: z.string(),
  type: z.enum(['create', 'update', 'delete', 'navigate', 'api', 'transform', 'custom'], { message: 'Invalid action type' }),
  target: z.string().optional(),
  payload: z.record(z.string(), z.any()).optional(),
  handler: z.string().optional(),
})

export const DataSourceSchema = z.object({
  id: z.string(),
  type: z.enum(['kv', 'api', 'static'], { message: 'Invalid data source type' }),
  key: z.string().optional(),
  endpoint: z.string().optional(),
  transform: z.string().optional(),
  defaultValue: z.any().optional(),
  dependencies: z.array(z.string()).optional(),
})

export const HookConfigSchema = z.object({
  name: z.string(),
  params: z.record(z.string(), z.any()).optional(),
  bindings: z.record(z.string(), z.string()).optional(),
})

export const ComponentPropsSchema = z.record(z.string(), z.any())

export const ComponentSchema: any = z.object({
  id: z.string(),
  type: z.string(),
  props: ComponentPropsSchema.optional(),
  children: z.lazy(() => z.array(ComponentSchema)).optional(),
  dataBinding: z.string().optional(),
  eventHandlers: z.record(z.string(), z.string()).optional(),
})

export const LayoutSchema = z.object({
  type: z.enum(['single', 'split', 'grid', 'tabs', 'flex'], { message: 'Invalid layout type' }),
  direction: z.enum(['horizontal', 'vertical', 'row', 'column'], { message: 'Invalid layout direction' }).optional(),
  panels: z.array(z.object({
    id: z.string(),
    minSize: z.number().optional(),
    maxSize: z.number().optional(),
    defaultSize: z.number().optional(),
  })).optional(),
})

export const PageSchemaDefinition = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  layout: LayoutSchema,
  components: z.array(ComponentSchema),
  dataSources: z.array(DataSourceSchema).optional(),
  actions: z.array(ActionSchema).optional(),
  hooks: z.array(HookConfigSchema).optional(),
  seedData: z.record(z.string(), z.any()).optional(),
  permissions: z.array(z.string()).optional(),
})

export type Action = z.infer<typeof ActionSchema>
export type DataSource = z.infer<typeof DataSourceSchema>
export type HookConfig = z.infer<typeof HookConfigSchema>
export type ComponentDef = z.infer<typeof ComponentSchema>
export type Layout = z.infer<typeof LayoutSchema>
export type PageSchema = z.infer<typeof PageSchemaDefinition>
