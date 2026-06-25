/**
 * Layout components A–D: accordion, app, card, dialogs, data source.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  AccordionProps, AppDialogsProps, AppLayoutProps,
  AppMainPanelProps, AppRouterLayoutProps,
  CardProps, CodeExplanationDialogProps,
  ComponentBindingDialogProps, DataSourceCardProps,
  DataSourceEditorDialogProps,
} from './interfaces'
import accordionDef from
  '@/components/json-definitions/accordion.json'
import appDialogsDef from
  '@/components/json-definitions/app-dialogs.json'
import appLayoutDef from
  '@/components/json-definitions/app-layout.json'
import appMainPanelDef from
  '@/components/json-definitions/app-main-panel.json'
import appRouterLayoutDef from
  '@/components/json-definitions/app-router-layout.json'
import cardDef from '@/components/json-definitions/card.json'
import codeExplanationDialogDef from
  '@/components/json-definitions/code-explanation-dialog.json'
import componentBindingDialogDef from
  '@/components/json-definitions/component-binding-dialog.json'
import dataSourceCardDef from
  '@/components/json-definitions/data-source-card.json'
import dataSourceEditorDialogDef from
  '@/components/json-definitions/data-source-editor-dialog.json'

export const MetabuilderWidgetAccordion =
  createJsonComponentWithHooks<AccordionProps>(accordionDef, {
    hooks: { accordionState: {
      hookName: 'useAccordion',
      args: (p) => [p.type || 'single', p.defaultOpen || []],
    } },
  })
export const MetabuilderWidgetAppDialogs =
  createJsonComponent<AppDialogsProps>(appDialogsDef)
export const MetabuilderWidgetAppLayout =
  createJsonComponentWithHooks<AppLayoutProps>(appLayoutDef, {
    hooks: { hookData: {
      hookName: 'useAppLayout', args: (p) => [p],
    } },
  })
export const MetabuilderWidgetAppMainPanel =
  createJsonComponent<AppMainPanelProps>(appMainPanelDef)
export const MetabuilderWidgetAppRouterLayout =
  createJsonComponentWithHooks<AppRouterLayoutProps>(
    appRouterLayoutDef,
    { hooks: { hookData: {
      hookName: 'useAppRouterLayout', args: (p) => [p],
    } } },
  )
export const MetabuilderLayoutCard =
  createJsonComponent<CardProps>(cardDef)
export const MetabuilderLayoutCodeExplanationDialog =
  createJsonComponent<CodeExplanationDialogProps>(
    codeExplanationDialogDef,
  )
export const MetabuilderLayoutComponentBindingDialog =
  createJsonComponent<ComponentBindingDialogProps>(
    componentBindingDialogDef,
  )
export const MetabuilderLayoutDataSourceCard =
  createJsonComponent<DataSourceCardProps>(dataSourceCardDef)
export const MetabuilderLayoutDataSourceEditorDialog =
  createJsonComponent<DataSourceEditorDialogProps>(
    dataSourceEditorDialogDef,
  )
