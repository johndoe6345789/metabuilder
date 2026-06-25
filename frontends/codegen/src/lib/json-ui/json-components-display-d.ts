/**
 * Display components T–Z: tables, text, timeline, tooltip, tree.
 */
import { createJsonComponent } from './create-json-component'
import type {
  TableProps, TagProps,
  TextGradientProps, TextHighlightProps, TextProps,
  TimelineProps, TimestampProps, TooltipProps, TreeIconProps,
} from './interfaces'
import tableDef from '@/components/json-definitions/table.json'
import tagDef from '@/components/json-definitions/tag.json'
import textDef from '@/components/json-definitions/text.json'
import textGradientDef from
  '@/components/json-definitions/text-gradient.json'
import textHighlightDef from
  '@/components/json-definitions/text-highlight.json'
import timelineDef from
  '@/components/json-definitions/timeline.json'
import timestampDef from
  '@/components/json-definitions/timestamp.json'
import tooltipDef from
  '@/components/json-definitions/tooltip.json'
import treeIconDef from
  '@/components/json-definitions/tree-icon.json'

export const MetabuilderDataTable =
  createJsonComponent<TableProps>(tableDef)
export const MetabuilderDisplayTag =
  createJsonComponent<TagProps>(tagDef)
export const MetabuilderDisplayText =
  createJsonComponent<TextProps>(textDef)
export const MetabuilderDisplayTextGradient =
  createJsonComponent<TextGradientProps>(textGradientDef)
export const MetabuilderDisplayTextHighlight =
  createJsonComponent<TextHighlightProps>(textHighlightDef)
export const MetabuilderDataTimeline =
  createJsonComponent<TimelineProps>(timelineDef)
export const MetabuilderWidgetTimestamp =
  createJsonComponent<TimestampProps>(timestampDef)
export const MetabuilderWidgetTooltip =
  createJsonComponent<TooltipProps>(tooltipDef)
export const MetabuilderDisplayTreeIcon =
  createJsonComponent<TreeIconProps>(treeIconDef)
