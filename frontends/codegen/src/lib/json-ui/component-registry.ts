import React, { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import jsonComponentsRegistry from '../../../json-components-registry.json'

export interface UIComponentRegistry {
  [key: string]: ComponentType<any>
}

interface JsonRegistryEntry {
  name?: string
  type?: string
  export?: string
  source?: string
  status?: string
  wrapperRequired?: boolean
  wrapperComponent?: string
  wrapperFor?: string
  load?: {
    path?: string
    export?: string
  }
  deprecated?: DeprecatedComponentInfo
}

interface JsonComponentRegistry {
  components?: JsonRegistryEntry[]
  sourceRoots?: Record<string, string[]>
}

export interface DeprecatedComponentInfo {
  replacedBy?: string
  message?: string
}

const jsonRegistry = jsonComponentsRegistry as JsonComponentRegistry

const getRegistryEntryKey = (entry: JsonRegistryEntry): string | undefined =>
  entry.name ?? entry.type

const getRegistryEntryExportName = (entry: JsonRegistryEntry): string | undefined =>
  entry.load?.export ?? entry.export ?? getRegistryEntryKey(entry)

const jsonRegistryEntries = jsonRegistry.components ?? []
const registryEntryByType = new Map(
  jsonRegistryEntries
    .map((entry) => {
      const entryKey = getRegistryEntryKey(entry)
      return entryKey ? [entryKey, entry] : null
    })
    .filter((entry): entry is [string, JsonRegistryEntry] => Boolean(entry))
)
const deprecatedComponentInfo = jsonRegistryEntries.reduce<Record<string, DeprecatedComponentInfo>>(
  (acc, entry) => {
    const entryKey = getRegistryEntryKey(entry)
    if (!entryKey) {
      return acc
    }
    if (entry.status === 'deprecated' || entry.deprecated) {
      acc[entryKey] = entry.deprecated ?? {}
    }
    return acc
  },
  {}
)



// FakeMUI primitives — registered explicitly to prevent collisions
// with icon names (e.g. "Stack" icon = createMaterialIcon('layers'))
// and to break circular JSON stub definitions (e.g. section.json has
// type: "Section" which would resolve back to itself without this).
import { Stack } from '@metabuilder/fakemui/layout'
import { Flex } from '@metabuilder/fakemui/layout'
import { Grid } from '@metabuilder/fakemui/layout'
import { Heading } from '@metabuilder/fakemui/atoms'
import { Text } from '@metabuilder/fakemui/atoms'
import { Section } from '@metabuilder/fakemui/atoms'
import { Separator } from '@metabuilder/fakemui/data-display'
import { Badge } from '@metabuilder/fakemui/data-display'
import { Chip } from '@metabuilder/fakemui/data-display'
import { Avatar } from '@metabuilder/fakemui/data-display'
import { AvatarGroup } from '@metabuilder/fakemui/data-display'
import { ButtonGroup } from '@metabuilder/fakemui/inputs'
import { IconButton } from '@metabuilder/fakemui/inputs'
import { Card } from '@metabuilder/fakemui/surfaces'
import { Alert, AlertDescription } from '@metabuilder/fakemui/feedback'
import { Link } from '@metabuilder/fakemui/navigation'

const fakeMuiComponents: UIComponentRegistry = {
  // HTML element aliases — components that used capital-letter names for <p> and <div>
  Paragraph: 'p' as unknown as ComponentType<any>,
  Div: 'div' as unknown as ComponentType<any>,
  Stack: Stack as unknown as ComponentType<any>,
  Flex: Flex as unknown as ComponentType<any>,
  Grid: Grid as unknown as ComponentType<any>,
  Heading: Heading as unknown as ComponentType<any>,
  Text: Text as unknown as ComponentType<any>,
  Section: Section as unknown as ComponentType<any>,
  Separator: Separator as unknown as ComponentType<any>,
  Badge: Badge as unknown as ComponentType<any>,
  Chip: Chip as unknown as ComponentType<any>,
  Avatar: Avatar as unknown as ComponentType<any>,
  AvatarGroup: AvatarGroup as unknown as ComponentType<any>,
  ButtonGroup: ButtonGroup as unknown as ComponentType<any>,
  IconButton: IconButton as unknown as ComponentType<any>,
  Card: Card as unknown as ComponentType<any>,
  Alert: Alert as unknown as ComponentType<any>,
  AlertDescription: AlertDescription as unknown as ComponentType<any>,
  Link: Link as unknown as ComponentType<any>,
}

// Explicit component-tree-builder sub-components — require.context lazy loading
// resolves these to () => null because the async dynamic import fails.
// Register them directly so the JSON renderer can find them.
import { ComponentTreeToolbar } from '@/components/component-tree-builder/ComponentTreeToolbar'
import { ComponentTreeView } from '@/components/component-tree-builder/ComponentTreeView'
import { ComponentInspector } from '@/components/component-tree-builder/ComponentInspector'

// MonacoEditorWrapper uses @monaco-editor/react which needs explicit registration
// (same issue — require.context + next/dynamic resolves to () => null).
import { MonacoEditorWrapper } from '@/components/ui/monaco-editor-wrapper'

// File explorer components — next/dynamic fallback resolves to () => null
// in Turbopack dev mode. Register explicitly so JSON renderer finds them.
import { FileExplorerList } from '@/components/file-explorer/FileExplorerList'
import { FileExplorerDialog } from '@/components/file-explorer/FileExplorerDialog'

// ScrollArea — explicit import (Turbopack dev mode doesn't resolve lazy contexts reliably)
import { ScrollArea } from '@/components/ui/scroll-area'

// Playwright designer sub-components — require.context + next/dynamic resolves
// to () => null in Turbopack dev mode for sub-directory components.
import { TestEditor } from '@/components/playwright-designer/TestEditor'
import { TestList } from '@/components/playwright-designer/TestList'

// Unit test designer sub-components — same Turbopack require.context issue.
import { TestSuiteList } from '@/components/unit-test-designer/TestSuiteList'
import { TestSuiteEditor } from '@/components/unit-test-designer/TestSuiteEditor'
import { TestCasesPanel } from '@/components/unit-test-designer/TestCasesPanel'

// Project settings sub-components — same Turbopack require.context issue.
import { NextJsConfigTab } from '@/components/project-settings/NextJsConfigTab'
import { ScriptDialog } from '@/components/project-settings/ScriptDialog'
import { ScriptsTab } from '@/components/project-settings/ScriptsTab'
import { PackageDialog } from '@/components/project-settings/PackageDialog'
import { PackagesTab } from '@/components/project-settings/PackagesTab'
import { DataTab } from '@/components/project-settings/DataTab'

// FakeMUI MD3 components — require.context is unreliable in Turbopack dev mode
// so all FakeMUI primitives used by JSON definitions must be imported explicitly.
import { Tabs, Tab, TabPanel } from '@metabuilder/fakemui/navigation'
import { CardHeader, CardContent, CardActions, CardTitle, CardDescription, CardFooter } from '@metabuilder/fakemui/surfaces'
import { Button, Switch, Checkbox, Select, Input, Textarea, Slider } from '@metabuilder/fakemui/inputs'
import { AlertTitle, Dialog, Progress, Skeleton } from '@metabuilder/fakemui/feedback'
import { Tooltip } from '@metabuilder/fakemui/data-display'
import { Label } from '@metabuilder/fakemui/atoms'
import { DialogContent, DialogHeader, DialogTitle, DialogContentText, DialogActions } from '@metabuilder/fakemui/utils'
import { Download, Plus, Trash, GitBranch as MergeIcon, Database, CheckCircle, Refresh, ArrowClockwise, Settings, Search, Check, Close, Edit, Warning, Info, CircleCheck } from '@metabuilder/fakemui/icons'
import { JSONUIShowcase } from '@/components/JSONUIShowcase'
import { SchemaEditorWorkspace } from '@/components/schema-editor/SchemaEditorWorkspace'

// Atomic library section components — require.context + next/dynamic resolves
// to () => null in Turbopack dev mode for sub-directory components.
import { ButtonsActionsSection } from '@/components/atomic-library/ButtonsActionsSection'
import { BadgesIndicatorsSection } from '@/components/atomic-library/BadgesIndicatorsSection'
import { TypographySection } from '@/components/atomic-library/TypographySection'
import { FormControlsSection } from '@/components/atomic-library/FormControlsSection'
import { ProgressLoadingSection } from '@/components/atomic-library/ProgressLoadingSection'
import { FeedbackSection } from '@/components/atomic-library/FeedbackSection'
import { AvatarsUserElementsSection } from '@/components/atomic-library/AvatarsUserElementsSection'
import { CardsMetricsSection } from '@/components/atomic-library/CardsMetricsSection'
import { InteractiveElementsSection } from '@/components/atomic-library/InteractiveElementsSection'
import { LayoutComponentsSection } from '@/components/atomic-library/LayoutComponentsSection'
import { EnhancedComponentsSection } from '@/components/atomic-library/EnhancedComponentsSection'
import { SummarySection } from '@/components/atomic-library/SummarySection'

const fakeMuiExplicitComponents: UIComponentRegistry = {
  // conditional-group: renders children (or else branch) without a wrapper element.
  // Used in JSON definitions for if/else button content switching.
  'conditional-group': React.Fragment as unknown as ComponentType<any>,
  Tabs: Tabs as unknown as ComponentType<any>,
  Tab: Tab as unknown as ComponentType<any>,
  TabPanel: TabPanel as unknown as ComponentType<any>,
  CardHeader: CardHeader as unknown as ComponentType<any>,
  CardContent: CardContent as unknown as ComponentType<any>,
  CardActions: CardActions as unknown as ComponentType<any>,
  CardTitle: CardTitle as unknown as ComponentType<any>,
  CardDescription: CardDescription as unknown as ComponentType<any>,
  CardFooter: CardFooter as unknown as ComponentType<any>,
  Button: Button as unknown as ComponentType<any>,
  AlertTitle: AlertTitle as unknown as ComponentType<any>,
  Chip: Chip as unknown as ComponentType<any>,
  Dialog: Dialog as unknown as ComponentType<any>,
  DialogContent: DialogContent as unknown as ComponentType<any>,
  DialogHeader: DialogHeader as unknown as ComponentType<any>,
  DialogTitle: DialogTitle as unknown as ComponentType<any>,
  DialogContentText: DialogContentText as unknown as ComponentType<any>,
  DialogActions: DialogActions as unknown as ComponentType<any>,
  Switch: Switch as unknown as ComponentType<any>,
  Checkbox: Checkbox as unknown as ComponentType<any>,
  Select: Select as unknown as ComponentType<any>,
  Input: Input as unknown as ComponentType<any>,
  Textarea: Textarea as unknown as ComponentType<any>,
  Slider: Slider as unknown as ComponentType<any>,
  Label: Label as unknown as ComponentType<any>,
  Tooltip: Tooltip as unknown as ComponentType<any>,
  Progress: Progress as unknown as ComponentType<any>,
  Skeleton: Skeleton as unknown as ComponentType<any>,
  Download: Download as unknown as ComponentType<any>,
  Plus: Plus as unknown as ComponentType<any>,
  Trash: Trash as unknown as ComponentType<any>,
  MergeIcon: MergeIcon as unknown as ComponentType<any>,
  // Common Material 3 icons used in JSON definitions
  Database: Database as unknown as ComponentType<any>,
  CheckCircle: CheckCircle as unknown as ComponentType<any>,
  CircleCheck: CircleCheck as unknown as ComponentType<any>,
  Refresh: Refresh as unknown as ComponentType<any>,
  ArrowClockwise: ArrowClockwise as unknown as ComponentType<any>,
  Settings: Settings as unknown as ComponentType<any>,
  Search: Search as unknown as ComponentType<any>,
  Check: Check as unknown as ComponentType<any>,
  Close: Close as unknown as ComponentType<any>,
  Edit: Edit as unknown as ComponentType<any>,
  Warning: Warning as unknown as ComponentType<any>,
  Info: Info as unknown as ComponentType<any>,
  MetabuilderWidgetJSONUIShowcase: JSONUIShowcase as unknown as ComponentType<any>,
  SchemaEditorWorkspace: SchemaEditorWorkspace as unknown as ComponentType<any>,
}

const componentTreeSubComponents: UIComponentRegistry = {
  ComponentTreeToolbar: ComponentTreeToolbar as unknown as ComponentType<any>,
  ComponentTreeView: ComponentTreeView as unknown as ComponentType<any>,
  ComponentInspector: ComponentInspector as unknown as ComponentType<any>,
  MonacoEditorWrapper: MonacoEditorWrapper as unknown as ComponentType<any>,
  FileExplorerList: FileExplorerList as unknown as ComponentType<any>,
  FileExplorerDialog: FileExplorerDialog as unknown as ComponentType<any>,
  ScrollArea: ScrollArea as unknown as ComponentType<any>,
  TestEditor: TestEditor as unknown as ComponentType<any>,
  TestList: TestList as unknown as ComponentType<any>,
  TestSuiteList: TestSuiteList as unknown as ComponentType<any>,
  TestSuiteEditor: TestSuiteEditor as unknown as ComponentType<any>,
  TestCasesPanel: TestCasesPanel as unknown as ComponentType<any>,
  NextJsConfigTab: NextJsConfigTab as unknown as ComponentType<any>,
  ScriptDialog: ScriptDialog as unknown as ComponentType<any>,
  ScriptsTab: ScriptsTab as unknown as ComponentType<any>,
  PackageDialog: PackageDialog as unknown as ComponentType<any>,
  PackagesTab: PackagesTab as unknown as ComponentType<any>,
  DataTab: DataTab as unknown as ComponentType<any>,
  ButtonsActionsSection: ButtonsActionsSection as unknown as ComponentType<any>,
  BadgesIndicatorsSection: BadgesIndicatorsSection as unknown as ComponentType<any>,
  TypographySection: TypographySection as unknown as ComponentType<any>,
  FormControlsSection: FormControlsSection as unknown as ComponentType<any>,
  ProgressLoadingSection: ProgressLoadingSection as unknown as ComponentType<any>,
  FeedbackSection: FeedbackSection as unknown as ComponentType<any>,
  AvatarsUserElementsSection: AvatarsUserElementsSection as unknown as ComponentType<any>,
  CardsMetricsSection: CardsMetricsSection as unknown as ComponentType<any>,
  InteractiveElementsSection: InteractiveElementsSection as unknown as ComponentType<any>,
  LayoutComponentsSection: LayoutComponentsSection as unknown as ComponentType<any>,
  EnhancedComponentsSection: EnhancedComponentsSection as unknown as ComponentType<any>,
  SummarySection: SummarySection as unknown as ComponentType<any>,
}

// Lazy contexts — each file becomes its own async chunk, loaded on demand.
// If one module has a bug, only that component fails (easier to debug).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webpackRequire = require as any
const atomContext = webpackRequire.context('@/components/atoms', false, /\.tsx$/) as __WebpackModuleApi.RequireContext
const moleculeContext = webpackRequire.context('@/components/molecules', false, /\.tsx$/) as __WebpackModuleApi.RequireContext
const organismContext = webpackRequire.context('@/components/organisms', false, /\.tsx$/) as __WebpackModuleApi.RequireContext
const explicitContext = webpackRequire.context('@/components', true, /\.tsx$/) as __WebpackModuleApi.RequireContext

const normalizeLoadPath = (loadPath: string): string => {
  // Convert @/components/Foo to ./Foo.tsx (require.context key format)
  let normalized = loadPath
  if (normalized.startsWith('@/components/')) {
    normalized = './' + normalized.slice('@/components/'.length)
  }
  if (!normalized.endsWith('.tsx') && !normalized.endsWith('.ts')) {
    normalized += '.tsx'
  }
  return normalized
}

// Create a next/dynamic wrapper that lazily loads a component from a webpack context
function createDynamicFromContext(
  ctx: __WebpackModuleApi.RequireContext,
  contextKey: string,
  exportName: string
): ComponentType<any> {
  return dynamic(
    () => ctx(contextKey).then((mod: any) => ({
      default: mod[exportName] ?? mod.default ?? (() => null)
    })),
    { ssr: false }
  )
}

// Find a context key by matching a load path or export name against context keys
function findContextKey(
  ctx: __WebpackModuleApi.RequireContext,
  loadPath?: string,
  exportName?: string,
  entryKey?: string
): string | undefined {
  if (loadPath) {
    const normalized = normalizeLoadPath(loadPath)
    const found = ctx.keys().find(k => k === loadPath || k === normalized)
    if (found) return found
  }
  // Try matching by filename
  if (exportName || entryKey) {
    return ctx.keys().find(k => {
      const name = k.replace(/^\.\//, '').replace(/\.(tsx?|jsx?)$/, '').split('/').pop()
      return name === exportName || name === entryKey
    })
  }
  return undefined
}

// Build registry entries using lazy context — each component is a next/dynamic wrapper
const buildRegistryFromEntries = (
  source: string,
  lazyCtx: __WebpackModuleApi.RequireContext | null,
  syncMap?: Record<string, ComponentType<any>>
): UIComponentRegistry => {
  return jsonRegistryEntries
    .filter((entry) => entry.source === source)
    .reduce<UIComponentRegistry>((registry, entry) => {
      const entryKey = getRegistryEntryKey(entry)
      const entryExportName = getRegistryEntryExportName(entry)
      if (!entryKey || !entryExportName) {
        return registry
      }

      // 1. Try sync map (for UI components loaded eagerly)
      if (syncMap?.[entryExportName]) {
        registry[entryKey] = syncMap[entryExportName]
        return registry
      }

      // 2. Try explicit load path via lazy context
      if (entry.load?.path) {
        const contextKey = findContextKey(explicitContext, entry.load.path)
        if (contextKey) {
          registry[entryKey] = createDynamicFromContext(explicitContext, contextKey, entryExportName)
          return registry
        }
      }

      // 3. Try source-specific lazy context
      if (lazyCtx) {
        const contextKey = findContextKey(lazyCtx, undefined, entryExportName, entryKey)
        if (contextKey) {
          registry[entryKey] = createDynamicFromContext(lazyCtx, contextKey, entryExportName)
          return registry
        }
      }

      // 4. Fallback: try explicit context by name
      const fallbackKey = findContextKey(explicitContext, undefined, entryExportName, entryKey)
      if (fallbackKey) {
        registry[entryKey] = createDynamicFromContext(explicitContext, fallbackKey, entryExportName)
      }

      return registry
    }, {})
}

// Primitive HTML elements are stored as string literals (e.g. 'div').
// React accepts strings as valid element types at runtime, but the registry
// type expects ComponentType<any>, so `as any` is required to satisfy the
// TypeScript type checker without wrapping every element in a function component.
export const primitiveComponents: UIComponentRegistry = {
  div: 'div' as any,
  span: 'span' as any,
  p: 'p' as any,
  option: 'option' as any,
  optgroup: 'optgroup' as any,
  h1: 'h1' as any,
  h2: 'h2' as any,
  h3: 'h3' as any,
  h4: 'h4' as any,
  h5: 'h5' as any,
  h6: 'h6' as any,
  section: 'section' as any,
  article: 'article' as any,
  header: 'header' as any,
  footer: 'footer' as any,
  main: 'main' as any,
  aside: 'aside' as any,
  nav: 'nav' as any,
  button: 'button' as any,
  input: 'input' as any,
  select: 'select' as any,
  textarea: 'textarea' as any,
  form: 'form' as any,
  label: 'label' as any,
  a: 'a' as any,
  img: 'img' as any,
  list: 'div' as any,
  text: 'span' as any,
  strong: 'strong' as any,
  em: 'em' as any,
  b: 'b' as any,
  i: 'i' as any,
  br: 'br' as any,
  small: 'small' as any,
  code: 'code' as any,
  pre: 'pre' as any,
  hr: 'hr' as any,
  ul: 'ul' as any,
  ol: 'ol' as any,
  li: 'li' as any,
  table: 'table' as any,
  thead: 'thead' as any,
  tbody: 'tbody' as any,
  tr: 'tr' as any,
  th: 'th' as any,
  td: 'td' as any,
}


export const atomComponents: UIComponentRegistry = buildRegistryFromEntries(
  'atoms',
  atomContext
)

export const moleculeComponents: UIComponentRegistry = buildRegistryFromEntries(
  'molecules',
  moleculeContext
)

export const organismComponents: UIComponentRegistry = buildRegistryFromEntries(
  'organisms',
  organismContext
)

export const jsonWrapperComponents: UIComponentRegistry = buildRegistryFromEntries(
  'wrappers',
  null
)

// Icons are lazy-loaded on first lookup via resolveIconComponent()
export const iconComponents: UIComponentRegistry = {}

export const customComponents: UIComponentRegistry = buildRegistryFromEntries(
  'custom',
  null
)

export const componentsComponents: UIComponentRegistry = buildRegistryFromEntries(
  'components',
  null
)

export const uiComponentRegistry: UIComponentRegistry = {
  ...primitiveComponents,
  ...atomComponents,
  ...moleculeComponents,
  ...organismComponents,
  ...jsonWrapperComponents,
  ...iconComponents,
  ...customComponents,
  ...componentsComponents,
  ...componentTreeSubComponents,
  // FakeMUI MD3 components override Shadcn equivalents (Card, Button, Alert, Dialog, Tabs, etc.)
  ...fakeMuiComponents,
  ...fakeMuiExplicitComponents,
}

export function registerComponent(name: string, component: ComponentType<any>) {
  uiComponentRegistry[name] = component
}

const resolveWrapperComponent = (type: string): ComponentType<any> | null => {
  const entry = registryEntryByType.get(type)
  if (entry?.wrapperRequired && entry.wrapperComponent) {
    return uiComponentRegistry[entry.wrapperComponent] || null
  }
  return null
}

// Lazy-loaded JSON components — each resolved via next/dynamic on first miss.
const jsonComponentDynamicCache = new Map<string, ComponentType<any>>()

// Short-name aliases: JSON definitions use these, but json-components.ts exports use MetabuilderWidget* prefix.
// Cannot import json-components.ts statically here (circular dep: json-components → createJsonComponent → component-registry).
const jsonComponentAliases: Record<string, string> = {
  SchemaEditorCanvas: 'MetabuilderWidgetSchemaEditorCanvas',
  SchemaEditorPropertiesPanel: 'MetabuilderWidgetSchemaEditorPropertiesPanel',
  SchemaEditorSidebar: 'MetabuilderWidgetSchemaEditorSidebar',
  SchemaEditorToolbar: 'MetabuilderWidgetSchemaEditorToolbar',
  CanvasRenderer: 'MetabuilderWidgetCanvasRenderer',
  ComponentPalette: 'MetabuilderWidgetComponentPalette',
}

function resolveJsonComponent(type: string): ComponentType<any> | null {
  const resolvedType = jsonComponentAliases[type] ?? type
  if (jsonComponentDynamicCache.has(resolvedType)) {
    return jsonComponentDynamicCache.get(resolvedType)!
  }
  const LazyJson = dynamic(
    () => import('@/lib/json-ui/json-components').then(mod => {
      const component = (mod as Record<string, any>)[resolvedType]
      if (!component) return { default: (() => null) as unknown as ComponentType }
      return { default: component }
    }),
    { ssr: false }
  )
  jsonComponentDynamicCache.set(resolvedType, LazyJson)
  uiComponentRegistry[resolvedType] = LazyJson
  return LazyJson
}

// Lazy-loaded Phosphor Icons via next/dynamic — creates a separate chunk
// that only loads when an icon is actually rendered (not at initial page load).
const iconDynamicCache = new Map<string, ComponentType<any>>()

function resolveIconComponent(type: string): ComponentType<any> | null {
  if (iconDynamicCache.has(type)) {
    return iconDynamicCache.get(type)!
  }
  const LazyIcon = dynamic(
    () => import('@metabuilder/fakemui/icons').then(mod => {
      const Icon = (mod as Record<string, any>)[type]
      if (!Icon) return { default: (() => null) as unknown as ComponentType }
      return { default: Icon }
    }),
    { ssr: false }
  )
  iconDynamicCache.set(type, LazyIcon)
  uiComponentRegistry[type] = LazyIcon
  return LazyIcon
}

export function getUIComponent(type: string): ComponentType<any> | string | null {
  // JSON components must resolve BEFORE icons — resolveIconComponent is a
  // catch-all that wraps any unknown type in a dynamic(() => null) from the
  // icon module, which would shadow the real JSON component definitions.
  return resolveWrapperComponent(type) ?? uiComponentRegistry[type]?? resolveJsonComponent(type) ?? resolveIconComponent(type) ?? null
}

export function hasComponent(type: string): boolean {
  return Boolean(resolveWrapperComponent(type) ?? uiComponentRegistry[type]?? resolveJsonComponent(type) ?? resolveIconComponent(type))
}

export function getDeprecatedComponentInfo(type: string): DeprecatedComponentInfo | null {
  return deprecatedComponentInfo[type] ?? null
}
