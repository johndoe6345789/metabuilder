import { z } from 'zod'

export const DataBindingSchema = z.object({
  source: z.string(),
  target: z.string(),
  transform: z.string().optional(),
})

export const EventHandlerSchema = z.object({
  event: z.string(),
  action: z.string(),
  params: z.record(z.string(), z.any()).optional(),
})

export const ComponentSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.string(), z.any()).optional(),
    children: z.array(ComponentSchema).optional(),
    bindings: z.array(DataBindingSchema).optional(),
    events: z.array(EventHandlerSchema).optional(),
    condition: z.string().optional(),
  })
)

export const DataSourceSchema = z.object({
  id: z.string(),
  type: z.enum(['kv', 'static', 'ai'], { message: 'Invalid data source type' }),
  key: z.string().optional(),
  defaultValue: z.any().optional(),
  dependencies: z.array(z.string()).optional(),
  expression: z.string().optional(),
  valueTemplate: z.record(z.string(), z.any()).optional(),
})

export const ActionConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['create', 'update', 'delete', 'navigate', 'ai-generate', 'custom'], { message: 'Invalid action type' }),
  trigger: z.string(),
  params: z.record(z.string(), z.any()).optional(),
  onSuccess: z.string().optional(),
  onError: z.string().optional(),
  handler: z.string().optional(),
})

export const HookConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  params: z.record(z.string(), z.any()).optional(),
  exports: z.array(z.string()).optional(),
})

export const LayoutConfigSchema = z.object({
  type: z.enum(['single', 'split', 'tabs', 'grid'], { message: 'Invalid layout type' }),
  direction: z.enum(['horizontal', 'vertical'], { message: 'Invalid direction' }).optional(),
  sizes: z.array(z.number()).optional(),
  gap: z.number().optional(),
})

export const PageSchemaType = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  layout: LayoutConfigSchema,
  components: z.array(ComponentSchema),
  data: z.array(DataSourceSchema).optional(),
  actions: z.array(ActionConfigSchema).optional(),
  hooks: z.array(HookConfigSchema).optional(),
  seedData: z.record(z.string(), z.any()).optional(),
})

export type PageSchema = z.infer<typeof PageSchemaType>
export type ComponentSchema = z.infer<typeof ComponentSchema>
export type DataSource = z.infer<typeof DataSourceSchema>
export type ActionConfig = z.infer<typeof ActionConfigSchema>
export type HookConfig = z.infer<typeof HookConfigSchema>
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>
export type DataBinding = z.infer<typeof DataBindingSchema>
export type EventHandler = z.infer<typeof EventHandlerSchema>
