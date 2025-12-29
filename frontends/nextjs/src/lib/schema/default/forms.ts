import type { FieldSchema } from '../../types/schema-types'
import { authorValidations, postValidations, productValidations } from './validation'

// Import JSON configuration files
// Note: These are loaded as ES modules thanks to resolveJsonModule in tsconfig.json
import postFieldsData from './config/post-fields.json'
import authorFieldsData from './config/author-fields.json'
import productFieldsData from './config/product-fields.json'

// Cast to proper type since JSON imports are 'any'
const postFieldsJson = postFieldsData as any[]
const authorFieldsJson = authorFieldsData as any[]
const productFieldsJson = productFieldsData as any[]

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
