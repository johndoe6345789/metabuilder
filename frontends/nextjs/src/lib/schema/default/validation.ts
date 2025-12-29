import type { FieldSchema } from '../../types/schema-types'

export const postValidations: Record<string, FieldSchema['validation']> = {
  title: { minLength: 3, maxLength: 200 },
  slug: { pattern: '^[a-z0-9-]+$' },
  excerpt: { maxLength: 500 },
  views: { min: 0 },
}

export const authorValidations: Record<string, FieldSchema['validation']> = {
  name: { minLength: 2, maxLength: 100 },
  bio: { maxLength: 1000 },
}

export const productValidations: Record<string, FieldSchema['validation']> = {
  name: { minLength: 3, maxLength: 200 },
  price: { min: 0 },
  stock: { min: 0 },
}
