import type { FieldSchema } from '../../types/schema-types'
import authorFieldsData from './config/author-fields.json'
// Import JSON configuration files as modules
// TypeScript's resolveJsonModule option enables importing .json files as typed objects
import postFieldsData from './config/post-fields.json'
import productFieldsData from './config/product-fields.json'
import { authorValidations, postValidations, productValidations } from './validation'

// Type assertion for JSON imports - they match FieldSchema structure minus validation functions
const postFieldsJson = postFieldsData as Omit<FieldSchema, 'validation'>[]
const authorFieldsJson = authorFieldsData as Omit<FieldSchema, 'validation'>[]
const productFieldsJson = productFieldsData as Omit<FieldSchema, 'validation'>[]

// Load from JSON and add validation functions
export const postFields: FieldSchema[] = postFieldsJson.map(field => {
  if (field.name === 'title') return { ...field, validation: postValidations.title }
  if (field.name === 'slug') return { ...field, validation: postValidations.slug }
  if (field.name === 'excerpt') return { ...field, validation: postValidations.excerpt }
  if (field.name === 'views') return { ...field, validation: postValidations.views }
  return field
})

export const authorFields: FieldSchema[] = authorFieldsJson.map(field => {
  if (field.name === 'name') return { ...field, validation: authorValidations.name }
  if (field.name === 'bio') return { ...field, validation: authorValidations.bio }
  return field
})

export const productFields: FieldSchema[] = productFieldsJson.map(field => {
  if (field.name === 'name') return { ...field, validation: productValidations.name }
  if (field.name === 'price') return { ...field, validation: productValidations.price }
  if (field.name === 'stock') return { ...field, validation: productValidations.stock }
  return field
})
