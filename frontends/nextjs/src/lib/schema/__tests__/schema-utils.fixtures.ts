import type { FieldSchema, ModelSchema, SchemaConfig } from '@/lib/schema-types'

export const createMockField = (): FieldSchema => ({
  name: 'email',
  type: 'email',
  label: 'Email Address',
  required: true,
  helpText: 'Enter a valid email',
})

export const createMockModel = (): ModelSchema => ({
  name: 'User',
  label: 'User Account',
  labelPlural: 'Users',
  fields: [
    { name: 'id', type: 'string', required: true },
    { name: 'name', type: 'string', required: true, label: 'Full Name' },
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'number' },
  ],
})

export const createMockSchema = (): SchemaConfig => ({
  apps: [
    {
      name: 'TestApp',
      models: [createMockModel()],
    },
  ],
})
