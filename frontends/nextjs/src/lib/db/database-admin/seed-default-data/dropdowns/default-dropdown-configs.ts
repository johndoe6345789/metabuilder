import type { DropdownConfig } from '../../../core/types'

export const buildDefaultDropdownConfigs = (): DropdownConfig[] => [
  {
    id: 'dropdown_status',
    name: 'status_options',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    id: 'dropdown_priority',
    name: 'priority_options',
    label: 'Priority',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    id: 'dropdown_category',
    name: 'category_options',
    label: 'Category',
    options: [
      { value: 'general', label: 'General' },
      { value: 'technical', label: 'Technical' },
      { value: 'business', label: 'Business' },
      { value: 'personal', label: 'Personal' },
    ],
  },
]
