/**
 * Page components C–E: config, container, dashboard, data, errors.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  ComprehensiveDemoHeaderProps, ComprehensiveDemoPageProps,
  ComprehensiveDemoStatsRowProps,
  ConfigCardProps, ContainerProps, DashboardDemoPageProps,
  DataListProps, DBALSearchInputProps,
  ErrorPanelEmptyStateProps, ErrorPanelHeaderProps,
  ErrorPanelMainProps, ErrorPanelProps,
} from './interfaces'
import comprehensiveDemoHeaderDef from
  '@/components/json-definitions/comprehensive-demo-header.json'
import comprehensiveDemoPageDef from
  '@/components/json-definitions/comprehensive-demo-page.json'
import comprehensiveDemoStatsRowDef from
  '@/components/json-definitions/comprehensive-demo-stats-row.json'
import configCardDef from
  '@/components/json-definitions/config-card.json'
import containerDef from
  '@/components/json-definitions/container.json'
import dashboardDemoPageDef from
  '@/components/json-definitions/dashboard-demo-page.json'
import dataListDef from
  '@/components/json-definitions/data-list.json'
import dbalSearchInputDef from
  '@/components/json-definitions/dbal-search-input.json'
import errorPanelDef from
  '@/components/json-definitions/error-panel.json'
import errorPanelEmptyStateDef from
  '@/components/json-definitions/error-panel-empty-state.json'
import errorPanelHeaderDef from
  '@/components/json-definitions/error-panel-header.json'
import errorPanelMainDef from
  '@/components/json-definitions/error-panel-main.json'

export const MetabuilderWidgetComprehensiveDemoHeader =
  createJsonComponent<ComprehensiveDemoHeaderProps>(
    comprehensiveDemoHeaderDef,
  )
export const MetabuilderWidgetComprehensiveDemoPage =
  createJsonComponent<ComprehensiveDemoPageProps>(
    comprehensiveDemoPageDef,
  )
export const MetabuilderWidgetComprehensiveDemoStatsRow =
  createJsonComponent<ComprehensiveDemoStatsRowProps>(
    comprehensiveDemoStatsRowDef,
  )
export const MetabuilderWidgetConfigCard =
  createJsonComponent<ConfigCardProps>(configCardDef)
export const MetabuilderLayoutContainer =
  createJsonComponent<ContainerProps>(containerDef)
export const MetabuilderWidgetDashboardDemoPage =
  createJsonComponent<DashboardDemoPageProps>(
    dashboardDemoPageDef,
  )
export const MetabuilderDataDataList =
  createJsonComponent<DataListProps>(dataListDef)
export const MetabuilderWidgetDBALSearchInput =
  createJsonComponentWithHooks<DBALSearchInputProps>(
    dbalSearchInputDef,
    { hooks: { hookData: {
      hookName: 'useDBALSearchInput',
      args: (p) => [{ onNavigate: p.onNavigate || (() => {}) }],
    } } },
  )
export const MetabuilderWidgetErrorPanel =
  createJsonComponentWithHooks<ErrorPanelProps>(
    errorPanelDef,
    { hooks: { panelState: {
      hookName: 'useErrorPanelMain',
      args: (p) => [{
        files: p.files,
        onFileChange: p.onFileChange,
        onFileSelect: p.onFileSelect,
      }], spread: true,
    } } },
  )
export const MetabuilderWidgetErrorPanelEmptyState =
  createJsonComponent<ErrorPanelEmptyStateProps>(
    errorPanelEmptyStateDef,
  )
export const MetabuilderWidgetErrorPanelHeader =
  createJsonComponent<ErrorPanelHeaderProps>(
    errorPanelHeaderDef,
  )
export const MetabuilderWidgetErrorPanelMain =
  createJsonComponentWithHooks<ErrorPanelMainProps>(
    errorPanelMainDef,
    { hooks: { panelState: {
      hookName: 'useErrorPanelMain',
      args: (p) => [p.files, p.onFileChange, p.onFileSelect],
    } } },
  )
