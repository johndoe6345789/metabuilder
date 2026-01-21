import { z } from 'zod'

export const UIValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.any()),
  z.record(z.string(), z.any()),
])

export const DataBindingSchema = z.object({
  source: z.string(),
  path: z.string().optional(),
  transform: z.string().optional(),
})

export const ActionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'create',
    'update',
    'delete',
    'navigate',
    'show-toast',
    'open-dialog',
    'close-dialog',
    'set-value',
    'toggle-value',
    'increment',
    'decrement',
    'custom',
  ]),
  target: z.string().optional(),
  path: z.string().optional(),
  value: z.any().optional(),
  params: z.record(z.string(), z.any()).optional(),
  expression: z.string().optional(),
  valueTemplate: z.record(z.string(), z.any()).optional(),
  message: z.string().optional(),
  variant: z.enum(['success', 'error', 'info', 'warning']).optional(),
})

export const EventHandlerSchema = z.object({
  event: z.string(),
  actions: z.array(ActionSchema),
  condition: z.string().optional(),
})

export const JSONEventDefinitionSchema = z.object({
  action: z.string().optional(),
  actions: z.array(ActionSchema).optional(),
  payload: z.record(z.string(), z.any()).optional(),
  condition: z.string().optional(),
})

export const JSONEventMapSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    JSONEventDefinitionSchema,
    z.array(JSONEventDefinitionSchema),
  ])
)

export const ConditionalSchema = z.object({
  if: z.string(),
  then: z.any().optional(),
  else: z.any().optional(),
})

export const UIComponentSchema: any = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.any()).optional(),
  className: z.string().optional(),
  style: z.record(z.string(), z.any()).optional(),
  bindings: z.record(z.string(), DataBindingSchema).optional(),
  children: z.union([
    z.string(),
    z.array(z.lazy(() => UIComponentSchema)),
  ]).optional(),
  dataBinding: z.union([
    z.string(),
    DataBindingSchema,
  ]).optional(),
  events: z.union([z.array(EventHandlerSchema), JSONEventMapSchema]).optional(),
  conditional: ConditionalSchema.optional(),
  loop: z.object({
    source: z.string(),
    itemVar: z.string(),
    indexVar: z.string().optional(),
  }).optional(),
})

export const FormFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'password', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file']),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  required: z.boolean().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.any(),
  })).optional(),
  conditional: ConditionalSchema.optional(),
})

export const FormSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  submitLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  onSubmit: EventHandlerSchema,
  onCancel: EventHandlerSchema.optional(),
  layout: z.enum(['vertical', 'horizontal', 'grid']).optional(),
})

export const TableColumnSchema = z.object({
  id: z.string(),
  header: z.string(),
  accessor: z.string(),
  type: z.enum(['text', 'number', 'date', 'badge', 'button', 'custom']).optional(),
  render: z.string().optional(),
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  width: z.string().optional(),
})

export const TableSchema = z.object({
  id: z.string(),
  dataSource: z.string(),
  columns: z.array(TableColumnSchema),
  pagination: z.boolean().optional(),
  pageSize: z.number().optional(),
  searchable: z.boolean().optional(),
  selectable: z.boolean().optional(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    handler: EventHandlerSchema,
  })).optional(),
})

export const DialogSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.union([
    z.string(),
    z.array(UIComponentSchema),
    FormSchema,
  ]),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).optional(),
    handler: EventHandlerSchema,
  })).optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl', 'full']).optional(),
})

export const LayoutSchema = z.object({
  type: z.enum(['flex', 'grid', 'stack', 'split', 'tabs']),
  direction: z.enum(['row', 'column', 'horizontal', 'vertical']).optional(),
  gap: z.string().optional(),
  padding: z.string().optional(),
  className: z.string().optional(),
  children: z.array(UIComponentSchema),
})

export const TabSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  content: z.array(UIComponentSchema),
  disabled: z.boolean().optional(),
})

export const TabsSchema = z.object({
  id: z.string(),
  tabs: z.array(TabSchema),
  defaultTab: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
})

export const MenuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  action: z.union([z.string(), EventHandlerSchema]).optional(),
  disabled: z.boolean().optional(),
  children: z.array(z.lazy(() => MenuItemSchema)).optional(),
})

export const MenuSchema = z.object({
  id: z.string(),
  items: z.array(MenuItemSchema),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
})

export const PageUISchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  layout: LayoutSchema,
  dialogs: z.array(DialogSchema).optional(),
  forms: z.array(FormSchema).optional(),
  tables: z.array(TableSchema).optional(),
  menus: z.array(MenuSchema).optional(),
  dataSources: z.record(z.string(), z.object({
    type: z.enum(['kv', 'api', 'static']),
    config: z.any(),
  })).optional(),
})

export type DataSourceConfig<T = unknown> =
  | {
      type: 'kv'
      config: {
        key?: string
        defaultValue?: T
      }
    }
  | {
      type: 'api'
      config: {
        url?: string
        defaultValue?: T
        transform?: (data: unknown) => T
      }
    }
  | {
      type: 'static'
      config: T
    }

export type UIValue = z.infer<typeof UIValueSchema>
export type DataBinding = z.infer<typeof DataBindingSchema>
export type Action = z.infer<typeof ActionSchema>
export type EventHandler = z.infer<typeof EventHandlerSchema>
export type JSONEventDefinition = z.infer<typeof JSONEventDefinitionSchema>
export type JSONEventMap = z.infer<typeof JSONEventMapSchema>
export type Conditional = z.infer<typeof ConditionalSchema>
export type UIComponent = z.infer<typeof UIComponentSchema>
export type FormField = z.infer<typeof FormFieldSchema>
export type Form = z.infer<typeof FormSchema>
export type TableColumn = z.infer<typeof TableColumnSchema>
export type Table = z.infer<typeof TableSchema>
export type Dialog = z.infer<typeof DialogSchema>
export type Layout = z.infer<typeof LayoutSchema>
export type Tab = z.infer<typeof TabSchema>
export type Tabs = z.infer<typeof TabsSchema>
export type MenuItem = z.infer<typeof MenuItemSchema>
export type Menu = z.infer<typeof MenuSchema>
export type PageUI = z.infer<typeof PageUISchema>
