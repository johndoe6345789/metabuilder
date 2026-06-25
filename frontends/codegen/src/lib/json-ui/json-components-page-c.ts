/**
 * Page components F–J: file explorer, flex, grid, header, info, JSON.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  FileExplorerProps, FlexLayoutProps, FlexProps,
  GlobalSearchProps, GridLayoutProps, GridProps,
  HeaderSearchProps, HowItWorksCardProps,
  InfoPanelProps, InfoSectionProps,
  JSONComponentTreeManagerProps, JSONConversionShowcaseProps,
  JSONDemoPageProps, JSONFlaskDesignerProps,
  JSONLambdaDesignerProps, JSONModelDesignerProps,
} from './interfaces'
import fileExplorerDef from
  '@/components/json-definitions/file-explorer.json'
import flexDef from '@/components/json-definitions/flex.json'
import flexLayoutDef from
  '@/components/json-definitions/flex-layout.json'
import globalSearchDef from
  '@/components/json-definitions/global-search.json'
import gridDef from '@/components/json-definitions/grid.json'
import gridLayoutDef from
  '@/components/json-definitions/grid-layout.json'
import headerSearchDef from
  '@/components/json-definitions/header-search.json'
import howItWorksCardDef from
  '@/components/json-definitions/how-it-works-card.json'
import infoPanelDef from
  '@/components/json-definitions/info-panel.json'
import infoSectionDef from
  '@/components/json-definitions/info-section.json'
import jsonComponentTreeManagerDef from
  '@/components/json-definitions/json-component-tree-manager.json'
import jsonConversionShowcaseDef from
  '@/components/json-definitions/json-conversion-showcase.json'
import jsonDemoPageDef from
  '@/components/json-definitions/json-demo-page.json'
import jsonFlaskDesignerDef from
  '@/components/json-definitions/json-flask-designer.json'
import jsonLambdaDesignerDef from
  '@/components/json-definitions/json-lambda-designer.json'
import jsonModelDesignerDef from
  '@/components/json-definitions/json-model-designer.json'

export const MetabuilderWidgetFileExplorer =
  createJsonComponent<FileExplorerProps>(fileExplorerDef)
export const MetabuilderLayoutFlex =
  createJsonComponent<FlexProps>(flexDef)
export const MetabuilderLayoutFlexLayout =
  createJsonComponent<FlexLayoutProps>(flexLayoutDef)
export const MetabuilderWidgetGlobalSearch =
  createJsonComponent<GlobalSearchProps>(globalSearchDef)
export const MetabuilderLayoutGrid =
  createJsonComponent<GridProps>(gridDef)
export const MetabuilderLayoutGridLayout =
  createJsonComponent<GridLayoutProps>(gridLayoutDef)
export const MetabuilderWidgetHeaderSearch =
  createJsonComponentWithHooks<HeaderSearchProps>(
    headerSearchDef,
    { hooks: { hookData: {
      hookName: 'useSearchInput',
      args: (p) => [{ onNavigate: p.onNavigate || (() => {}) }],
    } } },
  )
export const MetabuilderWidgetHowItWorksCard =
  createJsonComponent<HowItWorksCardProps>(howItWorksCardDef)
export const MetabuilderWidgetInfoPanel =
  createJsonComponent<InfoPanelProps>(infoPanelDef)
export const MetabuilderWidgetInfoSection =
  createJsonComponent<InfoSectionProps>(infoSectionDef)
export const MetabuilderWidgetJSONComponentTreeManager =
  createJsonComponent<JSONComponentTreeManagerProps>(
    jsonComponentTreeManagerDef,
  )
export const MetabuilderWidgetJSONConversionShowcase =
  createJsonComponent<JSONConversionShowcaseProps>(
    jsonConversionShowcaseDef,
  )
export const MetabuilderWidgetJSONDemoPage =
  createJsonComponent<JSONDemoPageProps>(jsonDemoPageDef)
export const MetabuilderWidgetJSONFlaskDesigner =
  createJsonComponent<JSONFlaskDesignerProps>(jsonFlaskDesignerDef)
export const MetabuilderWidgetJSONLambdaDesigner =
  createJsonComponent<JSONLambdaDesignerProps>(
    jsonLambdaDesignerDef,
  )
export const MetabuilderWidgetJSONModelDesigner =
  createJsonComponent<JSONModelDesignerProps>(jsonModelDesignerDef)
