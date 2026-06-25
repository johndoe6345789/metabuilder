/**
 * Page components A–C: atomic, completion, conflict.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  AtomicComponentShowcaseProps, AtomicLibraryShowcaseProps,
  CompletionCardProps, ComponentTreeDemoPageProps,
  ConflictCardProps, ConflictDetailsDialogProps,
  ConflictIndicatorProps, ConflictResolutionDemoProps,
  ConflictResolutionPageProps, ConflictResolutionStatsProps,
} from './interfaces'
import atomicComponentShowcaseDef from
  '@/components/json-definitions/atomic-component-showcase.json'
import atomicLibraryShowcaseDef from
  '@/components/json-definitions/atomic-library-showcase.json'
import completionCardDef from
  '@/components/json-definitions/completion-card.json'
import componentTreeDemoPageDef from
  '@/components/json-definitions/component-tree-demo-page.json'
import conflictCardDef from
  '@/components/json-definitions/conflict-card.json'
import conflictDetailsDialogDef from
  '@/components/json-definitions/conflict-details-dialog.json'
import conflictIndicatorDef from
  '@/components/json-definitions/conflict-indicator.json'
import conflictResolutionDemoDef from
  '@/components/json-definitions/conflict-resolution-demo.json'
import conflictResolutionPageDef from
  '@/components/json-definitions/conflict-resolution-page.json'
import conflictResolutionStatsDef from
  '@/components/json-definitions/conflict-resolution-stats.json'
export const MetabuilderWidgetAtomicComponentShowcase =
  createJsonComponent<AtomicComponentShowcaseProps>(
    atomicComponentShowcaseDef,
  )
export const MetabuilderWidgetAtomicLibraryShowcase =
  createJsonComponentWithHooks<AtomicLibraryShowcaseProps>(
    atomicLibraryShowcaseDef,
    { hooks: { showcaseState: {
      hookName: 'useAtomicLibraryShowcase', args: () => [],
    } } },
  )
export const MetabuilderLayoutCompletionCard =
  createJsonComponent<CompletionCardProps>(completionCardDef)
export const MetabuilderWidgetComponentTreeDemoPage =
  createJsonComponent<ComponentTreeDemoPageProps>(
    componentTreeDemoPageDef,
  )
export const MetabuilderWidgetConflictCard =
  createJsonComponentWithHooks<ConflictCardProps>(
    conflictCardDef,
    { hooks: { cardState: {
      hookName: 'useConflictCard',
      args: (p) => [p.conflict],
    } } },
  )
export const ConflictDetailsDialog =
  createJsonComponentWithHooks<ConflictDetailsDialogProps>(
    conflictDetailsDialogDef,
    { hooks: { dialogState: {
      hookName: 'useConflictDetailsDialog',
      args: (p) => [p.conflict],
    } } },
  )
export const MetabuilderWidgetConflictIndicator =
  createJsonComponentWithHooks<ConflictIndicatorProps>(
    conflictIndicatorDef,
    { hooks: {
      hasConflicts: { hookName: 'useConflictResolution',
        args: () => [],
        selector: (r) => r.hasConflicts },
      stats: { hookName: 'useConflictResolution',
        args: () => [],
        selector: (r) => r.stats },
    } },
  )
export const ConflictResolutionDemo =
  createJsonComponentWithHooks<ConflictResolutionDemoProps>(
    conflictResolutionDemoDef,
    { hooks: { demoState: {
      hookName: 'useConflictResolutionDemo', args: () => [],
    } } },
  )
export const MetabuilderWidgetConflictResolutionPage =
  createJsonComponentWithHooks<ConflictResolutionPageProps>(
    conflictResolutionPageDef,
    { hooks: { pageState: {
      hookName: 'useConflictResolutionPage',
      args: (p) => [p.copy || {}],
    } } },
  )
export const MetabuilderWidgetConflictResolutionStats =
  createJsonComponent<ConflictResolutionStatsProps>(
    conflictResolutionStatsDef,
  )
