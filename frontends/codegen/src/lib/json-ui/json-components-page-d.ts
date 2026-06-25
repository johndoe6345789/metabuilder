/**
 * Page components K–P: kbd, list, not-found, page, persistence, PWA.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  JSONStyleDesignerProps, JSONUIShowcasePageProps,
  JSONWorkflowDesignerProps,
  KbdProps, KeyValueProps, ListHeaderProps, NotFoundPageProps,
  PageHeaderContentProps, PageHeaderProps,
  PersistenceExampleProps, PreloadIndicatorProps,
  PWACacheSectionProps, PWAInstallPromptProps,
  PWAStatusBarProps, PWAUpdatePromptProps, PWAUpdateSectionProps,
} from './interfaces'
import jsonStyleDesignerDef from
  '@/components/json-definitions/json-style-designer.json'
import jsonUiShowcasePageDef from
  '@/components/json-definitions/json-ui-showcase-page.json'
import jsonWorkflowDesignerDef from
  '@/components/json-definitions/json-workflow-designer.json'
import kbdDef from '@/components/json-definitions/kbd.json'
import keyValueDef from
  '@/components/json-definitions/key-value.json'
import listHeaderDef from
  '@/components/json-definitions/list-header.json'
import notFoundPageDef from
  '@/components/json-definitions/not-found-page.json'
import pageHeaderContentDef from
  '@/components/json-definitions/page-header-content.json'
import pageHeaderDef from
  '@/components/json-definitions/page-header.json'
import persistenceExampleDef from
  '@/components/json-definitions/persistence-example.json'
import preloadIndicatorDef from
  '@/components/json-definitions/preload-indicator.json'
import pwaCacheSectionDef from
  '@/components/json-definitions/pwa-cache-section.json'
import pwaInstallPromptDef from
  '@/components/json-definitions/pwa-install-prompt.json'
import pwaStatusBarDef from
  '@/components/json-definitions/pwa-status-bar.json'
import pwaUpdatePromptDef from
  '@/components/json-definitions/pwa-update-prompt.json'
import pwaUpdateSectionDef from
  '@/components/json-definitions/pwa-update-section.json'

export const MetabuilderWidgetJSONStyleDesigner =
  createJsonComponent<JSONStyleDesignerProps>(jsonStyleDesignerDef)
export const MetabuilderWidgetJSONUIShowcasePage =
  createJsonComponent<JSONUIShowcasePageProps>(
    jsonUiShowcasePageDef,
  )
export const MetabuilderWidgetJSONWorkflowDesigner =
  createJsonComponent<JSONWorkflowDesignerProps>(
    jsonWorkflowDesignerDef,
  )
export const MetabuilderWidgetKbd =
  createJsonComponent<KbdProps>(kbdDef)
export const MetabuilderDataKeyValuePage =
  createJsonComponent<KeyValueProps>(keyValueDef)
export const MetabuilderWidgetListHeader =
  createJsonComponent<ListHeaderProps>(listHeaderDef)
export const MetabuilderWidgetNotFoundPage =
  createJsonComponent<NotFoundPageProps>(notFoundPageDef)
export const MetabuilderWidgetPageHeaderContent =
  createJsonComponent<PageHeaderContentProps>(
    pageHeaderContentDef,
  )
export const MetabuilderWidgetPageHeader =
  createJsonComponent<PageHeaderProps>(pageHeaderDef)
export const MetabuilderWidgetPersistenceExample =
  createJsonComponentWithHooks<PersistenceExampleProps>(
    persistenceExampleDef,
    { hooks: { exampleState: {
      hookName: 'usePersistenceExample', args: () => [],
    } } },
  )
export const MetabuilderWidgetPreloadIndicator =
  createJsonComponent<PreloadIndicatorProps>(preloadIndicatorDef)
export const MetabuilderWidgetPWACacheSection =
  createJsonComponent<PWACacheSectionProps>(pwaCacheSectionDef)
export const MetabuilderWidgetPWAInstallPrompt =
  createJsonComponent<PWAInstallPromptProps>(pwaInstallPromptDef)
export const MetabuilderWidgetPWAStatusBar =
  createJsonComponent<PWAStatusBarProps>(pwaStatusBarDef)
export const MetabuilderWidgetPWAUpdatePrompt =
  createJsonComponent<PWAUpdatePromptProps>(pwaUpdatePromptDef)
export const MetabuilderWidgetPWAUpdateSection =
  createJsonComponent<PWAUpdateSectionProps>(pwaUpdateSectionDef)
