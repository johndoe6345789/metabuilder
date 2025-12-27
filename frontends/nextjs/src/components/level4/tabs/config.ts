import {
  BookOpen,
  Code,
  Database as DatabaseIcon,
  Gear,
  HardDrives,
  Lightning,
  ListDashes,
  MapTrifold,
  Package,
  Palette,
  Sparkle,
  SquaresFour,
  Tree,
  Users,
  Warning,
} from '@phosphor-icons/react'

export type Level4TabValue =
  | 'guide'
  | 'packages'
  | 'pages'
  | 'hierarchy'
  | 'users'
  | 'schemas'
  | 'workflows'
  | 'lua'
  | 'blocks'
  | 'snippets'
  | 'css'
  | 'dropdowns'
  | 'database'
  | 'settings'
  | 'errorlogs'

export interface Level4TabConfig {
  value: Level4TabValue
  label: string
  icon: typeof DatabaseIcon
  nerdOnly?: boolean
}

export const level4TabsConfig: Level4TabConfig[] = [
  { value: 'guide', label: 'Guide', icon: Sparkle },
  { value: 'packages', label: 'Packages', icon: Package },
  { value: 'pages', label: 'Page Routes', icon: MapTrifold },
  { value: 'hierarchy', label: 'Components', icon: Tree },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'schemas', label: 'Schemas', icon: DatabaseIcon },
  { value: 'workflows', label: 'Workflows', icon: Lightning, nerdOnly: true },
  { value: 'lua', label: 'Lua Scripts', icon: Code, nerdOnly: true },
  { value: 'blocks', label: 'Lua Blocks', icon: SquaresFour, nerdOnly: true },
  { value: 'snippets', label: 'Snippets', icon: BookOpen, nerdOnly: true },
  { value: 'css', label: 'CSS Classes', icon: Palette, nerdOnly: true },
  { value: 'dropdowns', label: 'Dropdowns', icon: ListDashes, nerdOnly: true },
  { value: 'database', label: 'Database', icon: HardDrives, nerdOnly: true },
  { value: 'settings', label: 'Settings', icon: Gear },
  { value: 'errorlogs', label: 'Error Logs', icon: Warning },
]
