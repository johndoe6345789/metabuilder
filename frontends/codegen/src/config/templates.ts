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

export const templates: Template[] = [
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
