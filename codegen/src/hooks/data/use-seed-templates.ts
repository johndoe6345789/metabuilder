/// <reference path="../global.d.ts" />

import { useState } from 'react'
import { ecommerceTemplate, blogTemplate, dashboardTemplate } from '@/config/seed-templates'
import defaultTemplate from '@/config/seed-data.json'

export type TemplateType = 'default' | 'e-commerce' | 'blog' | 'dashboard'

export interface Template {
  id: TemplateType
  name: string
  description: string
  icon: string
  data: Record<string, any>
  features: string[]
}

const templates: Template[] = [
  {
    id: 'default',
    name: 'Default Project',
    description: 'Basic starter template with common components',
    icon: '🚀',
    data: defaultTemplate,
    features: ['Basic models', 'Sample components', 'User workflow']
  },
  {
    id: 'e-commerce',
    name: 'E-Commerce Store',
    description: 'Complete online store with products, cart, and checkout',
    icon: '🛍️',
    data: ecommerceTemplate,
    features: [
      'Product catalog',
      'Shopping cart',
      'Order management',
      'Customer accounts',
      'Payment processing'
    ]
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Content-focused blog with authors, posts, and comments',
    icon: '📝',
    data: blogTemplate,
    features: [
      'Post management',
      'Author profiles',
      'Comment system',
      'Newsletter',
      'SEO optimization'
    ]
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard with metrics and reports',
    icon: '📊',
    data: dashboardTemplate,
    features: [
      'Real-time metrics',
      'Data visualization',
      'User management',
      'Activity logging',
      'Alert system'
    ]
  }
]

export function useSeedTemplates() {
  const [isLoading, setIsLoading] = useState(false)

  const getTemplates = () => templates

  const getTemplate = (id: TemplateType): Template | undefined => {
    return templates.find(t => t.id === id)
  }

  const loadTemplate = async (templateId: TemplateType) => {
    setIsLoading(true)
    try {
      const template = getTemplate(templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      for (const [key, value] of Object.entries(template.data)) {
        await window.spark.kv.set(key, value)
      }

      return true
    } catch (error) {
      console.error('Failed to load template:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const clearAndLoadTemplate = async (templateId: TemplateType) => {
    setIsLoading(true)
    try {
      const keys = await window.spark.kv.keys()
      for (const key of keys) {
        await window.spark.kv.delete(key)
      }

      const success = await loadTemplate(templateId)
      return success
    } catch (error) {
      console.error('Failed to clear and load template:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const mergeTemplate = async (templateId: TemplateType) => {
    setIsLoading(true)
    try {
      const template = getTemplate(templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      for (const [key, value] of Object.entries(template.data)) {
        const existingData = await window.spark.kv.get<any[]>(key)
        if (existingData && Array.isArray(existingData) && Array.isArray(value)) {
          const mergedData = [...existingData, ...value]
          await window.spark.kv.set(key, mergedData)
        } else {
          await window.spark.kv.set(key, value)
        }
      }

      return true
    } catch (error) {
      console.error('Failed to merge template:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    templates,
    isLoading,
    getTemplates,
    getTemplate,
    loadTemplate,
    clearAndLoadTemplate,
    mergeTemplate
  }
}
