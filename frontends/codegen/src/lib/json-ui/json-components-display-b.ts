/**
 * Display components F–L: file icons, headings, labels, loading, lists.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  FileIconProps, HeadingProps, HelperTextProps,
  IconProps, IconTextProps, IconWrapperProps, InfoBoxProps,
  KeyValueProps, LabelProps,
  LazyBarChartProps, LazyD3BarChartProps, LazyLineChartProps,
  LinkProps,
  ListItemProps, ListProps, LiveIndicatorProps,
  LoadingFallbackProps, LoadingSpinnerProps, LoadingStateProps,
} from './interfaces'
import fileIconDef from
  '@/components/json-definitions/file-icon.json'
import headingDef from
  '@/components/json-definitions/heading.json'
import helperTextDef from
  '@/components/json-definitions/helper-text.json'
import iconDef from '@/components/json-definitions/icon.json'
import iconTextDef from
  '@/components/json-definitions/icon-text.json'
import iconWrapperDef from
  '@/components/json-definitions/icon-wrapper.json'
import infoBoxDef from
  '@/components/json-definitions/info-box.json'
import keyValueDef from
  '@/components/json-definitions/key-value.json'
import labelDef from '@/components/json-definitions/label.json'
import lazyBarChartDef from
  '@/components/json-definitions/lazy-bar-chart.json'
import lazyD3BarChartDef from
  '@/components/json-definitions/lazy-d3-bar-chart.json'
import lazyLineChartDef from
  '@/components/json-definitions/lazy-line-chart.json'
import linkDef from '@/components/json-definitions/link.json'
import listDef from '@/components/json-definitions/list.json'
import listItemDef from
  '@/components/json-definitions/list-item.json'
import liveIndicatorDef from
  '@/components/json-definitions/live-indicator.json'
import loadingFallbackDef from
  '@/components/json-definitions/loading-fallback.json'
import loadingSpinnerDef from
  '@/components/json-definitions/loading-spinner.json'
import loadingStateDef from
  '@/components/json-definitions/loading-state.json'

export const MetabuilderDisplayFileIcon =
  createJsonComponent<FileIconProps>(fileIconDef)
export const MetabuilderDisplayHeading =
  createJsonComponent<HeadingProps>(headingDef)
export const MetabuilderDisplayHelperText =
  createJsonComponent<HelperTextProps>(helperTextDef)
export const MetabuilderDisplayIcon =
  createJsonComponent<IconProps>(iconDef)
export const MetabuilderDisplayIconText =
  createJsonComponent<IconTextProps>(iconTextDef)
export const MetabuilderDisplayIconWrapper =
  createJsonComponent<IconWrapperProps>(iconWrapperDef)
export const MetabuilderFeedbackInfoBox =
  createJsonComponent<InfoBoxProps>(infoBoxDef)
export const MetabuilderDataKeyValue =
  createJsonComponent<KeyValueProps>(keyValueDef)
export const MetabuilderDisplayLabel =
  createJsonComponent<LabelProps>(labelDef)
export const MetabuilderDataLazyBarChart =
  createJsonComponent<LazyBarChartProps>(lazyBarChartDef)
export const MetabuilderDataLazyD3BarChart =
  createJsonComponentWithHooks<LazyD3BarChartProps>(
    lazyD3BarChartDef,
    {
      hooks: {
        chartData: {
          hookName: 'useD3BarChart',
          args: (props) => [
            props.data, props.width, props.height,
          ],
        },
      },
    },
  )
export const MetabuilderDataLazyLineChart =
  createJsonComponent<LazyLineChartProps>(lazyLineChartDef)
export const MetabuilderNavLink =
  createJsonComponent<LinkProps>(linkDef)
export const MetabuilderDataList =
  createJsonComponent<ListProps<any>>(listDef)
export const MetabuilderDataListItem =
  createJsonComponent<ListItemProps>(listItemDef)
export const MetabuilderWidgetLiveIndicator =
  createJsonComponent<LiveIndicatorProps>(liveIndicatorDef)
export const MetabuilderFeedbackLoadingFallback =
  createJsonComponent<LoadingFallbackProps>(loadingFallbackDef)
export const MetabuilderFeedbackLoadingSpinner =
  createJsonComponent<LoadingSpinnerProps>(loadingSpinnerDef)
export const MetabuilderFeedbackLoadingState =
  createJsonComponent<LoadingStateProps>(loadingStateDef)
