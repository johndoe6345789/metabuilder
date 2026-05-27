/**
 * Widget components S: schema editor, seed data manager.
 */
import { createJsonComponent } from './create-json-component'
import type {
  SchemaCodeViewerProps, SchemaEditorCanvasProps,
  SchemaEditorLayoutProps, SchemaEditorPageProps,
  SchemaEditorPropertiesPanelProps, SchemaEditorSidebarProps,
  SchemaEditorStatusBarProps, SchemaEditorToolbarProps,
  SeedDataManagerProps,
} from './interfaces'
import schemaCodeViewerDef from
  '@/components/json-definitions/schema-code-viewer.json'
import schemaEditorCanvasDef from
  '@/components/json-definitions/schema-editor-canvas.json'
import schemaEditorLayoutDef from
  '@/components/json-definitions/schema-editor-layout.json'
import schemaEditorPageDef from
  '@/components/json-definitions/schema-editor-page.json'
import schemaEditorPropertiesPanelDef from
  '@/components/json-definitions/schema-editor-properties-panel.json'
import schemaEditorSidebarDef from
  '@/components/json-definitions/schema-editor-sidebar.json'
import schemaEditorStatusBarDef from
  '@/components/json-definitions/schema-editor-status-bar.json'
import schemaEditorToolbarDef from
  '@/components/json-definitions/schema-editor-toolbar.json'
import seedDataManagerDef from
  '@/components/json-definitions/seed-data-manager.json'

export const MetabuilderDisplaySchemaCodeViewer =
  createJsonComponent<SchemaCodeViewerProps>(
    schemaCodeViewerDef,
  )
export const MetabuilderWidgetSchemaEditorCanvas =
  createJsonComponent<SchemaEditorCanvasProps>(
    schemaEditorCanvasDef,
  )
export const MetabuilderWidgetSchemaEditorLayout =
  createJsonComponent<SchemaEditorLayoutProps>(
    schemaEditorLayoutDef,
  )
export const MetabuilderWidgetSchemaEditorPage =
  createJsonComponent<SchemaEditorPageProps>(
    schemaEditorPageDef,
  )
export const MetabuilderWidgetSchemaEditorPropertiesPanel =
  createJsonComponent<SchemaEditorPropertiesPanelProps>(
    schemaEditorPropertiesPanelDef,
  )
export const MetabuilderWidgetSchemaEditorSidebar =
  createJsonComponent<SchemaEditorSidebarProps>(
    schemaEditorSidebarDef,
  )
export const MetabuilderFeedbackSchemaEditorStatusBar =
  createJsonComponent<SchemaEditorStatusBarProps>(
    schemaEditorStatusBarDef,
  )
export const MetabuilderWidgetSchemaEditorToolbar =
  createJsonComponent<SchemaEditorToolbarProps>(
    schemaEditorToolbarDef,
  )
export const MetabuilderDataSeedDataManager =
  createJsonComponent<SeedDataManagerProps>(seedDataManagerDef)
