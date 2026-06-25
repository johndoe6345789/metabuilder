/**
 * Widget components S–U: storybook, templates, toolbar, translation,
 * tree, unit test.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  StorageSettingsPanelProps, StorageSettingsProps,
  StorybookDesignerProps, TemplateExplorerProps,
  TemplateSelectorProps, ToolbarActionsProps,
  TranslationEditorProps, TreeListPanelProps,
  UnitTestDesignerProps,
} from './interfaces'
import storageSettingsDef from
  '@/components/json-definitions/storage-settings.json'
import storageSettingsPanelDef from
  '@/components/json-definitions/storage-settings-panel.json'
import storybookDesignerDef from
  '@/components/json-definitions/storybook-designer.json'
import templateExplorerDef from
  '@/components/json-definitions/template-explorer.json'
import templateSelectorDef from
  '@/components/json-definitions/template-selector.json'
import toolbarActionsDef from
  '@/components/json-definitions/toolbar-actions.json'
import translationEditorDef from
  '@/components/json-definitions/translation-editor.json'
import treeListPanelDef from
  '@/components/json-definitions/tree-list-panel.json'
import unitTestDesignerDef from
  '@/components/json-definitions/unit-test-designer.json'

export const MetabuilderWidgetStorageSettings =
  createJsonComponentWithHooks<StorageSettingsProps>(
    storageSettingsDef,
    { hooks: { backendInfo: {
      hookName: 'useStorageBackendInfo',
      args: (p) => [p.backend || null],
    } } },
  )
export const MetabuilderWidgetStorageSettingsPanel =
  createJsonComponent<StorageSettingsPanelProps>(
    storageSettingsPanelDef,
  )

export const MetabuilderWidgetStorybookDesigner =
  createJsonComponentWithHooks<StorybookDesignerProps>(
    storybookDesignerDef,
    { hooks: { designerState: {
      hookName: 'useStorybookDesigner',
      args: (p) => [{
        stories: p.stories, onStoriesChange: p.onStoriesChange,
      }],
    } } },
  )
export const MetabuilderWidgetTemplateExplorer =
  createJsonComponent<TemplateExplorerProps>(
    templateExplorerDef,
  )
export const MetabuilderWidgetTemplateSelector =
  createJsonComponentWithHooks<TemplateSelectorProps>(
    templateSelectorDef,
    { hooks: { hookData: {
      hookName: 'useTemplateSelector', args: () => [],
    } } },
  )
export const MetabuilderWidgetToolbarActions =
  createJsonComponent<ToolbarActionsProps>(toolbarActionsDef)
export const MetabuilderWidgetTranslationEditor =
  createJsonComponentWithHooks<TranslationEditorProps>(
    translationEditorDef,
    { hooks: { hookData: {
      hookName: 'useTranslationEditor', args: () => [],
    } } },
  )
export const MetabuilderDataTreeListPanel =
  createJsonComponent<TreeListPanelProps>(treeListPanelDef)
export const MetabuilderWidgetUnitTestDesigner =
  createJsonComponentWithHooks<UnitTestDesignerProps>(
    unitTestDesignerDef,
    { hooks: { designerState: {
      hookName: 'useUnitTestDesigner',
      args: (p) => [{
        tests: p.tests, onTestsChange: p.onTestsChange,
      }],
    } } },
  )
