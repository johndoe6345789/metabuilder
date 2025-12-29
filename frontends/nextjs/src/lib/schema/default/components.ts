import type { AppSchema, ModelSchema } from '../../types/schema-types'
import { authorFields, postFields, productFields } from './forms'

export const blogModels: ModelSchema[] = [
  {
    name: 'post',
    label: 'Post',
    labelPlural: 'Posts',
    icon: 'Article',
    listDisplay: ['title', 'author', 'status', 'publishedAt'],
    listFilter: ['status', 'author'],
    searchFields: ['title', 'content'],
    ordering: ['-publishedAt'],
    fields: postFields,
  },
  {
    name: 'author',
    label: 'Author',
    labelPlural: 'Authors',
    icon: 'User',
    listDisplay: ['name', 'email', 'active', 'createdAt'],
    listFilter: ['active'],
    searchFields: ['name', 'email'],
    ordering: ['name'],
    fields: authorFields,
  },
]

export const ecommerceModels: ModelSchema[] = [
  {
    name: 'product',
    label: 'Product',
    labelPlural: 'Products',
    icon: 'ShoppingCart',
    listDisplay: ['name', 'price', 'stock', 'available'],
    listFilter: ['available', 'category'],
    searchFields: ['name', 'description'],
    ordering: ['name'],
    fields: productFields,
  },
]

export const defaultApps: AppSchema[] = [
  {
    name: 'blog',
    label: 'Blog',
    models: blogModels,
  },
  {
    name: 'ecommerce',
    label: 'E-Commerce',
    models: ecommerceModels,
  },
]
