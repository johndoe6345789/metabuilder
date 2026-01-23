/**
 * @metabuilder/core-hooks
 *
 * Generic, reusable React hooks for common UI patterns.
 * Zero dependencies - no Redux, services, or external libraries required.
 *
 * Works across all frontends and applications.
 *
 * @example
 * // Dialog management
 * import { useDialog } from '@metabuilder/core-hooks'
 *
 * function MyComponent() {
 *   const dialog = useDialog()
 *   return (
 *     <>
 *       <button onClick={dialog.open}>Open Dialog</button>
 *       {dialog.isOpen && <Dialog onClose={dialog.close} />}
 *     </>
 *   )
 * }
 *
 * @example
 * // Tab switching
 * import { useTabs } from '@metabuilder/core-hooks'
 *
 * function Tabs() {
 *   const tabs = useTabs('home')
 *   return (
 *     <>
 *       {['home', 'about', 'contact'].map(tab => (
 *         <button
 *           key={tab}
 *           onClick={() => tabs.switchTab(tab as any)}
 *           active={tabs.isActive(tab as any)}
 *         >
 *           {tab}
 *         </button>
 *       ))}
 *     </>
 *   )
 * }
 *
 * @example
 * // List operations with selection
 * import { useListOperations } from '@metabuilder/core-hooks'
 *
 * function ItemList() {
 *   const list = useListOperations<Item>({
 *     initialItems: items,
 *     getId: item => item.id
 *   })
 *   return (
 *     <>
 *       {list.items.map(item => (
 *         <button key={item.id} onClick={() => list.toggleSelection(item.id)}>
 *           {list.isSelected(item.id) ? '✓' : ''} {item.name}
 *         </button>
 *       ))}
 *     </>
 *   )
 * }
 */

// Dialog & Confirmation
export { useDialog, type UseDialogReturn } from './dialog'
export { useConfirmation, type UseConfirmationReturn } from './confirmation'
export { useConfirmDialog, type ConfirmDialogOptions, type UseConfirmDialogReturn } from './confirm-dialog'

// Tabs & Toggle
export { useTabs, type UseTabsReturn } from './tabs'
export { useToggle, type UseToggleOptions, type UseToggleReturn } from './toggle'

// Selection & List Management
export { useSelection, type UseSelectionReturn } from './selection'
export { useListOperations, type ListOperationsOptions, type UseListOperationsReturn } from './list-operations'

// Focus & Copy
export { useFocusState, type UseFocusStateReturn } from './focus-state'
export { useCopyState, type UseCopyStateReturn } from './copy-state'

// Other
export { usePasswordVisibility, type UsePasswordVisibilityReturn } from './password-visibility'
export { useAccordion, type UseAccordionReturn } from './accordion'
