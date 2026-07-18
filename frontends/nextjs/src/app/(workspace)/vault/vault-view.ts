import definition from './vault-view.json'
import type { VaultDraft } from './vault-types'

export type VaultFieldKey = keyof VaultDraft
export type VaultTabId = 'identity' | 'credentials' | 'links' | 'notes'
export type VaultHeaderActionId = 'reload' | 'lock' | 'new'
export type VaultEditorActionId = 'copyUsername' | 'copyPassword' |
  'copyTurbologin' | 'save' | 'delete'
export type VaultComponentId = 'Page' | 'Loading' | 'Notice' |
  'SplitLayout' | 'ListPanel' | 'EditorPanel' | 'Repeat' |
  'div' | 'header' | 'button' | 'strong' | 'span' | 'TextField' | 'Chip' |
  'Button' | 'Typography' | 'Paper' | 'Alert'

export type VaultBinding =
  | { $path: string }
  | { $template: string }
  | { $event: string | { $path: string }; $value?: 'target.value'; $args?: VaultBinding[] }
  | { $eq: [string | boolean | VaultBinding, string | boolean | VaultBinding] }
  | { $not: VaultBinding }
  | { $or: VaultBinding[] }
  | { $and: VaultBinding[] }
  | { $if: { condition: VaultBinding; then: string | boolean | VaultBinding; else: string | boolean | VaultBinding } }
  | { $classes: Array<string | { name: string; when: VaultBinding }> }

export type VaultTreeNode = {
  component: VaultComponentId
  className?: string | VaultBinding
  props?: Record<string, string | boolean | VaultBinding>
  source?: VaultBinding
  item?: string
  key?: VaultBinding
  text?: VaultBinding
  when?: VaultBinding
  children?: VaultTreeNode[]
}

export type VaultFieldDefinition = {
  key: VaultFieldKey
  label: string
  type: 'text' | 'password' | 'url' | 'textarea'
  required?: boolean
  rows?: number
  fullRow?: boolean
  event: `vault.events.${string}`
}

export type VaultActionDefinition<TId extends string> = {
  id: TId
  label: string
  variant: 'contained' | 'outlined'
  requires?: VaultFieldKey[]
  requiresEntry?: boolean
  event: `vault.events.${string}`
}

type VaultViewDefinition = {
  hooks: Array<{ id: 'vault'; hook: 'useVaultController' }>
  title: string
  loadingLabel: string
  entryCountLabel: string
  list: { searchLabel: string; shownLabel: string; searchEvent: `vault.events.${string}`; selectEvent: `vault.events.${string}` }
  unlock: { description: string; passwordLabel: string; actionLabel: string; changeEvent: `vault.events.${string}`; submitEvent: `vault.events.${string}` }
  views: Record<'loading' | 'locked' | 'unlocked', VaultTreeNode>
  headerActions: Array<VaultActionDefinition<VaultHeaderActionId>>
  tabs: Array<{ id: VaultTabId; label: string; event: `vault.events.${string}`; fields: VaultFieldDefinition[] }>
  editorActions: Array<VaultActionDefinition<VaultEditorActionId>>
}

export const vaultView = definition as VaultViewDefinition
