/**
 * Widget components P–S: project, PWA, save, schema, seed, storage.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  PersistenceDashboardProps, PlaywrightDesignerProps,
  ProjectManagerProps, ProjectSettingsDesignerProps,
  PWASettingsProps, SaveIndicatorProps,
} from './interfaces'
import persistenceDashboardDef from
  '@/components/json-definitions/persistence-dashboard.json'
import playwrightDesignerDef from
  '@/components/json-definitions/playwright-designer.json'
import projectManagerDef from
  '@/components/json-definitions/project-manager.json'
import projectSettingsDesignerDef from
  '@/components/json-definitions/project-settings-designer.json'
import pwaSettingsDef from
  '@/components/json-definitions/pwa-settings.json'
import saveIndicatorDef from
  '@/components/json-definitions/save-indicator.json'
export const MetabuilderWidgetPersistenceDashboard =
  createJsonComponentWithHooks<PersistenceDashboardProps>(
    persistenceDashboardDef,
    { hooks: { viewData: {
      hookName: 'usePersistenceDashboardView',
      args: () => [],
    } } },
  )
export const MetabuilderWidgetPlaywrightDesigner =
  createJsonComponentWithHooks<PlaywrightDesignerProps>(
    playwrightDesignerDef,
    { hooks: { designerState: {
      hookName: 'usePlaywrightDesigner',
      args: (p) => [p.tests, p.onTestsChange],
      spread: true,
    } } },
  )
export const MetabuilderWidgetProjectManager =
  createJsonComponentWithHooks<ProjectManagerProps>(
    projectManagerDef,
    { hooks: { hookData: {
      hookName: 'useProjectManagerDropdown',
      args: () => [],
    } } },
  )
export const MetabuilderWidgetProjectSettingsDesigner =
  createJsonComponentWithHooks<ProjectSettingsDesignerProps>(
    projectSettingsDesignerDef,
    { hooks: { settingsState: {
      hookName: 'useProjectSettingsView',
      args: (p) => [{
        nextjsConfig: p.nextjsConfig,
        npmSettings: p.npmSettings,
        onNextjsConfigChange: p.onNextjsConfigChange,
        onNpmSettingsChange: p.onNpmSettingsChange,
      }], spread: true,
    } } },
  )
export const MetabuilderWidgetPWASettings =
  createJsonComponentWithHooks<PWASettingsProps>(
    pwaSettingsDef,
    { hooks: { pwaState: {
      hookName: 'usePWASettings', args: () => [],
    } } },
  )
export const MetabuilderWidgetSaveIndicator =
  createJsonComponentWithHooks<SaveIndicatorProps>(
    saveIndicatorDef,
    { hooks: { hookData: {
      hookName: 'useSaveIndicator',
      args: (p) => [p.lastSaved ?? null],
    } } },
  )
