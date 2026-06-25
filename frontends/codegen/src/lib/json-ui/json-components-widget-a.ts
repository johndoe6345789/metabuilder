/**
 * Widget components A–D: app, binding, canvas, code, components, data.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  AppHeaderProps, BindingEditorProps, CanvasRendererProps,
  CodeEditorProps, ComponentPaletteProps,
  ComponentTreeBuilderProps, ComponentTreeNodeProps,
  ComponentTreeProps, DataBindingDesignerProps,
  DataSourceManagerProps,
} from './interfaces'
import appHeaderDef from
  '@/components/json-definitions/app-header.json'
import bindingEditorDef from
  '@/components/json-definitions/binding-editor.json'
import canvasRendererDef from
  '@/components/json-definitions/canvas-renderer.json'
import codeEditorDef from
  '@/components/json-definitions/code-editor.json'
import componentPaletteDef from
  '@/components/json-definitions/component-palette.json'
import componentTreeBuilderDef from
  '@/components/json-definitions/component-tree-builder.json'
import componentTreeDef from
  '@/components/json-definitions/component-tree.json'
import componentTreeNodeDef from
  '@/components/json-definitions/component-tree-node.json'
import dataBindingDesignerDef from
  '@/components/json-definitions/data-binding-designer.json'
import dataSourceManagerDef from
  '@/components/json-definitions/data-source-manager.json'

export const MetabuilderWidgetAppHeader =
  createJsonComponent<AppHeaderProps>(appHeaderDef)
export const MetabuilderWidgetBindingEditor =
  createJsonComponentWithHooks<BindingEditorProps>(
    bindingEditorDef,
    { hooks: { editorState: {
      hookName: 'useBindingEditor',
      args: (props) => [props.bindings, props.onChange],
    } } },
  )
export const MetabuilderWidgetCanvasRenderer =
  createJsonComponent<CanvasRendererProps>(canvasRendererDef)
export const MetabuilderWidgetCodeEditor =
  createJsonComponentWithHooks<CodeEditorProps>(
    codeEditorDef,
    { hooks: { editorState: {
      hookName: 'useCodeEditor',
      args: (props) => [{ files: props.files,
        activeFileId: props.activeFileId,
        onFileChange: props.onFileChange,
        onFileSelect: props.onFileSelect,
        onFileClose: props.onFileClose }],
    } } },
  )
export const MetabuilderWidgetComponentPalette =
  createJsonComponent<ComponentPaletteProps>(componentPaletteDef)
export const MetabuilderWidgetComponentTree =
  createJsonComponentWithHooks<ComponentTreeProps>(
    componentTreeDef,
    { hooks: { treeData: {
      hookName: 'useComponentTree',
      args: (props) => [
        props.components || [], props.selectedId || null,
      ],
    } } },
  )
export const MetabuilderWidgetComponentTreeBuilder =
  createJsonComponentWithHooks<ComponentTreeBuilderProps>(
    componentTreeBuilderDef,
    { hooks: { builderState: {
      hookName: 'useComponentTreeBuilder',
      args: (props) => [{ components: props.components,
        onComponentsChange: props.onComponentsChange }],
    } } },
  )
export const MetabuilderWidgetComponentTreeNode =
  createJsonComponent<ComponentTreeNodeProps>(componentTreeNodeDef)
export const MetabuilderWidgetDataBindingDesigner =
  createJsonComponentWithHooks<DataBindingDesignerProps>(
    dataBindingDesignerDef,
    { hooks: { designerState: {
      hookName: 'useDataBindingDesigner',
      args: () => [],
    } } },
  )
export const MetabuilderDataDataSourceManager =
  createJsonComponentWithHooks<DataSourceManagerProps>(
    dataSourceManagerDef,
    { hooks: { managerState: {
      hookName: 'useDataSourceManagerState',
      args: (props) => [
        props.dataSources || [], props.onChange || (() => {}),
      ],
    } } },
  )
