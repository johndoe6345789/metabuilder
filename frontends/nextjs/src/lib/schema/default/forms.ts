import type { FieldSchema } from '../../types/schema-types'
import { authorValidations, postValidations, productValidations } from './validation'

// Import JSON configuration files
const postFieldsJson: any[] = require('./config/post-fields.json')
const authorFieldsJson: any[] = require('./config/author-fields.json')
const productFieldsJson: any[] = require('./config/product-fields.json')

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
