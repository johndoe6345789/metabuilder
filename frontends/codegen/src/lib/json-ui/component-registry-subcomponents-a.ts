/**
 * UI tool sub-components: component tree, file explorer,
 * Monaco editor, test editors, project settings.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from 'react'
import type { UIComponentRegistry } from './component-registry-types'
import { ComponentTreeToolbar } from
  '@/components/component-tree-builder/ComponentTreeToolbar'
import { ComponentTreeView } from
  '@/components/component-tree-builder/ComponentTreeView'
import { ComponentInspector } from
  '@/components/component-tree-builder/ComponentInspector'
import { MonacoEditorWrapper } from
  '@/components/ui/monaco-editor-wrapper'
import { FileExplorerList } from
  '@/components/file-explorer/FileExplorerList'
import { FileExplorerDialog } from
  '@/components/file-explorer/FileExplorerDialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TestEditor } from
  '@/components/playwright-designer/TestEditor'
import { TestList } from
  '@/components/playwright-designer/TestList'
import { TestSuiteList } from
  '@/components/unit-test-designer/TestSuiteList'
import { TestSuiteEditor } from
  '@/components/unit-test-designer/TestSuiteEditor'
import { TestCasesPanel } from
  '@/components/unit-test-designer/TestCasesPanel'
import { NextJsConfigTab } from
  '@/components/project-settings/NextJsConfigTab'
import { ScriptDialog } from
  '@/components/project-settings/ScriptDialog'
import { ScriptsTab } from
  '@/components/project-settings/ScriptsTab'
import { PackageDialog } from
  '@/components/project-settings/PackageDialog'
import { PackagesTab } from
  '@/components/project-settings/PackagesTab'
import { DataTab } from
  '@/components/project-settings/DataTab'

const C = <T>(c: T) => c as unknown as ComponentType<any>

export const uiToolsSubComponents: UIComponentRegistry = {
  ComponentTreeToolbar: C(ComponentTreeToolbar),
  ComponentTreeView: C(ComponentTreeView),
  ComponentInspector: C(ComponentInspector),
  MonacoEditorWrapper: C(MonacoEditorWrapper),
  FileExplorerList: C(FileExplorerList),
  FileExplorerDialog: C(FileExplorerDialog),
  ScrollArea: C(ScrollArea),
  TestEditor: C(TestEditor),
  TestList: C(TestList),
  TestSuiteList: C(TestSuiteList),
  TestSuiteEditor: C(TestSuiteEditor),
  TestCasesPanel: C(TestCasesPanel),
  NextJsConfigTab: C(NextJsConfigTab),
  ScriptDialog: C(ScriptDialog),
  ScriptsTab: C(ScriptsTab),
  PackageDialog: C(PackageDialog),
  PackagesTab: C(PackagesTab),
  DataTab: C(DataTab),
}
