import { getUsers, setUsers } from '../users'
import { setCredential } from '../credentials'
import { getAppConfig, setAppConfig } from '../app-config'
import { getCssClasses, setCssClasses } from '../css-classes'
import { getDropdownConfigs, setDropdownConfigs } from '../dropdown-configs'
import { hashPassword } from '../password/hash-password'
import type { CssCategory, DropdownConfig } from '../types'
import type { User, AppConfiguration } from '../../types/level-types'

const uniqueClasses = (classes: string[]) => Array.from(new Set(classes))
const buildScaleClasses = (prefixes: string[], scale: string[]) =>
  prefixes.flatMap((prefix) => scale.map((value) => `${prefix}-${value}`))

const spacingScale = ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10', '12', '16']
const spacingClasses = uniqueClasses([
  ...buildScaleClasses(
    ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'],
    spacingScale
  ),
  ...buildScaleClasses(['gap', 'gap-x', 'gap-y'], ['0', '1', '2', '3', '4', '6', '8', '10', '12', '16']),
  ...buildScaleClasses(['space-x', 'space-y'], ['0', '1', '2', '3', '4', '6', '8', '10', '12', '16']),
])

const sizeScale = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64']
const sizingClasses = uniqueClasses([
  ...buildScaleClasses(['w', 'h'], sizeScale),
  'w-auto',
  'w-full',
  'w-screen',
  'w-min',
  'w-max',
  'w-fit',
  'h-auto',
  'h-full',
  'h-screen',
  'h-min',
  'h-max',
  'h-fit',
  'min-w-0',
  'min-w-full',
  'min-w-min',
  'min-w-max',
  'min-w-fit',
  'min-h-0',
  'min-h-full',
  'min-h-screen',
  'min-h-min',
  'min-h-max',
  'min-h-fit',
  'max-w-none',
  'max-w-xs',
  'max-w-sm',
  'max-w-md',
  'max-w-lg',
  'max-w-xl',
  'max-w-2xl',
  'max-w-3xl',
  'max-w-4xl',
  'max-w-5xl',
  'max-w-6xl',
  'max-w-7xl',
  'max-w-full',
  'max-w-screen-sm',
  'max-w-screen-md',
  'max-w-screen-lg',
  'max-w-screen-xl',
  'max-h-none',
  'max-h-full',
  'max-h-screen',
  'w-1/2',
  'w-1/3',
  'w-2/3',
  'w-1/4',
  'w-2/4',
  'w-3/4',
  'w-1/5',
  'w-2/5',
  'w-3/5',
  'w-4/5',
  'w-1/6',
  'w-2/6',
  'w-3/6',
  'w-4/6',
  'w-5/6',
  'h-1/2',
  'h-1/3',
  'h-2/3',
  'h-1/4',
  'h-2/4',
  'h-3/4',
  'h-1/5',
  'h-2/5',
  'h-3/5',
  'h-4/5',
])

const DEFAULT_CSS_CLASSES: CssCategory[] = [
  {
    name: 'Layout',
    classes: [
      'block',
      'inline-block',
      'inline',
      'flex',
      'inline-flex',
      'grid',
      'inline-grid',
      'contents',
      'hidden',
      'flex-row',
      'flex-row-reverse',
      'flex-col',
      'flex-col-reverse',
      'flex-wrap',
      'flex-wrap-reverse',
      'flex-nowrap',
    ],
  },
  {
    name: 'Spacing',
    classes: spacingClasses,
  },
  {
    name: 'Sizing',
    classes: sizingClasses,
  },
  {
    name: 'Typography',
    classes: [
      'text-xs',
      'text-sm',
      'text-base',
      'text-lg',
      'text-xl',
      'text-2xl',
      'text-3xl',
      'text-4xl',
      'text-5xl',
      'text-6xl',
      'font-thin',
      'font-light',
      'font-normal',
      'font-medium',
      'font-semibold',
      'font-bold',
      'font-extrabold',
      'font-black',
      'leading-none',
      'leading-tight',
      'leading-snug',
      'leading-normal',
      'leading-relaxed',
      'leading-loose',
      'tracking-tighter',
      'tracking-tight',
      'tracking-normal',
      'tracking-wide',
      'tracking-wider',
      'tracking-widest',
      'text-left',
      'text-center',
      'text-right',
      'text-justify',
      'uppercase',
      'lowercase',
      'capitalize',
      'normal-case',
      'italic',
      'not-italic',
      'underline',
      'no-underline',
      'line-through',
      'font-sans',
      'font-serif',
      'font-mono',
    ],
  },
  {
    name: 'Colors',
    classes: [
      'text-foreground',
      'text-muted-foreground',
      'text-primary',
      'text-primary-foreground',
      'text-secondary',
      'text-secondary-foreground',
      'text-accent',
      'text-accent-foreground',
      'text-destructive',
      'text-destructive-foreground',
      'bg-background',
      'bg-card',
      'bg-muted',
      'bg-accent',
      'bg-primary',
      'bg-secondary',
      'bg-destructive',
      'bg-popover',
      'bg-transparent',
      'bg-white',
      'bg-black',
      'text-white',
      'text-black',
      'border-border',
      'border-input',
      'border-primary',
      'border-secondary',
      'border-accent',
      'border-destructive',
      'ring-ring',
      'ring-primary',
      'ring-secondary',
      'ring-accent',
      'ring-destructive',
    ],
  },
  {
    name: 'Borders',
    classes: [
      'border',
      'border-0',
      'border-2',
      'border-4',
      'border-8',
      'border-t',
      'border-b',
      'border-l',
      'border-r',
      'border-x',
      'border-y',
      'border-solid',
      'border-dashed',
      'border-dotted',
      'border-double',
      'border-hidden',
      'rounded-none',
      'rounded-sm',
      'rounded',
      'rounded-md',
      'rounded-lg',
      'rounded-xl',
      'rounded-2xl',
      'rounded-3xl',
      'rounded-full',
    ],
  },
  {
    name: 'Effects',
    classes: [
      'shadow-none',
      'shadow-sm',
      'shadow',
      'shadow-md',
      'shadow-lg',
      'shadow-xl',
      'shadow-2xl',
      'shadow-inner',
      'ring-0',
      'ring-1',
      'ring-2',
      'ring-4',
      'ring-offset-1',
      'ring-offset-2',
      'opacity-0',
      'opacity-25',
      'opacity-50',
      'opacity-75',
      'opacity-100',
      'transition',
      'transition-all',
      'transition-colors',
      'transition-opacity',
      'transition-transform',
      'duration-75',
      'duration-100',
      'duration-150',
      'duration-200',
      'duration-300',
      'duration-500',
      'ease-in',
      'ease-out',
      'ease-in-out',
      'blur-none',
      'blur-sm',
      'blur',
      'blur-md',
      'blur-lg',
      'backdrop-blur',
      'backdrop-blur-sm',
    ],
  },
  {
    name: 'Positioning',
    classes: [
      'static',
      'relative',
      'absolute',
      'fixed',
      'sticky',
      'inset-0',
      'inset-x-0',
      'inset-y-0',
      'top-0',
      'right-0',
      'bottom-0',
      'left-0',
      'z-auto',
      'z-0',
      'z-10',
      'z-20',
      'z-30',
      'z-40',
      'z-50',
      'overflow-hidden',
      'overflow-auto',
      'overflow-scroll',
      'overflow-visible',
      'overflow-x-auto',
      'overflow-y-auto',
    ],
  },
  {
    name: 'Alignment',
    classes: [
      'items-start',
      'items-center',
      'items-end',
      'items-stretch',
      'items-baseline',
      'justify-start',
      'justify-center',
      'justify-end',
      'justify-between',
      'justify-around',
      'justify-evenly',
      'content-start',
      'content-center',
      'content-end',
      'self-start',
      'self-center',
      'self-end',
      'self-stretch',
      'place-items-start',
      'place-items-center',
      'place-items-end',
    ],
  },
  {
    name: 'Interactivity',
    classes: [
      'cursor-pointer',
      'cursor-default',
      'cursor-not-allowed',
      'pointer-events-none',
      'pointer-events-auto',
      'select-none',
      'select-text',
      'select-all',
      'select-auto',
      'hover:bg-accent',
      'hover:text-accent-foreground',
      'hover:underline',
      'active:scale-95',
      'focus:ring-2',
      'focus:ring-primary',
      'focus-visible:outline-none',
      'disabled:opacity-50',
      'disabled:pointer-events-none',
    ],
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
  const users = await getUsers({ scope: 'all' })
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
