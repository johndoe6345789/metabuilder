import { getUsers, setUsers } from '../users'
import { setCredential } from '../credentials'
import { getAppConfig, setAppConfig } from '../app-config'
import { getCssClasses, setCssClasses } from '../css-classes'
import { getDropdownConfigs, setDropdownConfigs } from '../dropdown-configs'
import { hashPassword } from '../hash-password'
import type { CssCategory, DropdownConfig } from '../types'
import type { User, AppConfiguration } from '../../types/level-types'

const DEFAULT_CSS_CLASSES: CssCategory[] = [
  {
    name: 'Layout',
    classes: ['flex', 'flex-col', 'flex-row', 'grid', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'block', 'inline-block', 'inline', 'hidden'],
  },
  {
    name: 'Spacing',
    classes: ['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8'],
  },
  {
    name: 'Sizing',
    classes: ['w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-auto', 'h-full', 'h-screen', 'h-auto', 'min-h-screen', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-7xl'],
  },
  {
    name: 'Typography',
    classes: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'text-left', 'text-center', 'text-right', 'uppercase', 'lowercase', 'capitalize'],
  },
  {
    name: 'Colors',
    classes: ['text-primary', 'text-secondary', 'text-accent', 'text-muted-foreground', 'bg-primary', 'bg-secondary', 'bg-accent', 'bg-background', 'bg-card', 'bg-muted', 'border-primary', 'border-secondary', 'border-accent', 'border-border'],
  },
  {
    name: 'Borders',
    classes: ['border', 'border-2', 'border-4', 'border-t', 'border-b', 'border-l', 'border-r', 'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
  },
  {
    name: 'Effects',
    classes: ['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'hover:shadow-lg', 'opacity-0', 'opacity-50', 'opacity-75', 'opacity-100', 'transition', 'transition-all', 'duration-200', 'duration-300', 'duration-500'],
  },
  {
    name: 'Positioning',
    classes: ['relative', 'absolute', 'fixed', 'sticky', 'top-0', 'bottom-0', 'left-0', 'right-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
  },
  {
    name: 'Alignment',
    classes: ['items-start', 'items-center', 'items-end', 'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'self-start', 'self-center', 'self-end'],
  },
  {
    name: 'Interactivity',
    classes: ['cursor-pointer', 'cursor-default', 'pointer-events-none', 'select-none', 'hover:bg-accent', 'hover:text-accent-foreground', 'active:scale-95', 'disabled:opacity-50'],
  },
]

const DEFAULT_DROPDOWN_CONFIGS: DropdownConfig[] = [
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

/**
 * Seed database with default data
 */
export async function seedDefaultData(): Promise<void> {
  // Create default users if none exist
  const users = await getUsers()
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: 'user_supergod',
        username: 'supergod',
        email: 'supergod@system.local',
        role: 'supergod',
        createdAt: Date.now(),
        isInstanceOwner: true,
      },
      {
        id: 'user_god',
        username: 'god',
        email: 'god@system.local',
        role: 'god',
        createdAt: Date.now(),
        isInstanceOwner: false,
      },
    ]
    await setUsers(defaultUsers)

    // Set default passwords
    for (const user of defaultUsers) {
      const hash = await hashPassword(user.username)
      await setCredential(user.username, hash)
    }
  }

  // Create default app config if none exists
  const appConfig = await getAppConfig()
  if (!appConfig) {
    const defaultConfig: AppConfiguration = {
      id: 'app_001',
      name: 'MetaBuilder App',
      schemas: [],
      workflows: [],
      luaScripts: [],
      pages: [],
      theme: {
        colors: {},
        fonts: {},
      },
    }
    await setAppConfig(defaultConfig)
  }

  // Create default CSS classes if none exist
  const cssClasses = await getCssClasses()
  if (cssClasses.length === 0) {
    await setCssClasses(DEFAULT_CSS_CLASSES)
  }

  // Create default dropdown configs if none exist
  const dropdowns = await getDropdownConfigs()
  if (dropdowns.length === 0) {
    await setDropdownConfigs(DEFAULT_DROPDOWN_CONFIGS)
  }
}
