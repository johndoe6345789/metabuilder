/**
 * Display components A–E: actions, alerts, avatars, badges, charts.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  ActionCardProps, ActionIconProps, AlertProps,
  AppBrandingProps, AppLogoProps,
  AvatarGroupProps, AvatarProps,
  BadgeProps, ColorSwatchProps,
  ComponentPaletteItemProps,
  CountBadgeProps, DataSourceBadgeProps,
  DataTableProps, DetailRowProps,
  DividerProps, DotProps,
  EmptyMessageProps, EmptyStateIconProps, EmptyStateProps,
  ErrorBadgeProps,
} from './interfaces'
import actionCardDef from
  '@/components/json-definitions/action-card.json'
import actionIconDef from
  '@/components/json-definitions/action-icon.json'
import alertDef from '@/components/json-definitions/alert.json'
import appBrandingDef from
  '@/components/json-definitions/app-branding.json'
import appLogoDef from
  '@/components/json-definitions/app-logo.json'
import avatarDef from '@/components/json-definitions/avatar.json'
import avatarGroupDef from
  '@/components/json-definitions/avatar-group.json'
import badgeDef from '@/components/json-definitions/badge.json'
import colorSwatchDef from
  '@/components/json-definitions/color-swatch.json'
import componentPaletteItemDef from
  '@/components/json-definitions/component-palette-item.json'
import countBadgeDef from
  '@/components/json-definitions/count-badge.json'
import dataSourceBadgeDef from
  '@/components/json-definitions/data-source-badge.json'
import dataTableDef from
  '@/components/json-definitions/data-table.json'
import detailRowDef from
  '@/components/json-definitions/detail-row.json'
import dividerDef from
  '@/components/json-definitions/divider.json'
import dotDef from '@/components/json-definitions/dot.json'
import emptyMessageDef from
  '@/components/json-definitions/empty-message.json'
import emptyStateDef from
  '@/components/json-definitions/empty-state.json'
import emptyStateIconDef from
  '@/components/json-definitions/empty-state-icon.json'
import errorBadgeDef from
  '@/components/json-definitions/error-badge.json'

export const MetabuilderLayoutActionCard =
  createJsonComponent<ActionCardProps>(actionCardDef)
export const MetabuilderDisplayActionIcon =
  createJsonComponent<ActionIconProps>(actionIconDef)
export const MetabuilderFeedbackAlert =
  createJsonComponent<AlertProps>(alertDef)
export const MetabuilderWidgetAppBranding =
  createJsonComponent<AppBrandingProps>(appBrandingDef)
export const MetabuilderWidgetAppLogo =
  createJsonComponent<AppLogoProps>(appLogoDef)
export const MetabuilderDisplayAvatar =
  createJsonComponent<AvatarProps>(avatarDef)
export const MetabuilderDisplayAvatarGroup =
  createJsonComponent<AvatarGroupProps>(avatarGroupDef)
export const MetabuilderDisplayBadge =
  createJsonComponent<BadgeProps>(badgeDef)
export const MetabuilderWidgetColorSwatch =
  createJsonComponent<ColorSwatchProps>(colorSwatchDef)
export const MetabuilderWidgetComponentPaletteItem =
  createJsonComponent<ComponentPaletteItemProps>(
    componentPaletteItemDef,
  )
export const MetabuilderFeedbackCountBadge =
  createJsonComponent<CountBadgeProps>(countBadgeDef)
export const MetabuilderFeedbackDataSourceBadge =
  createJsonComponent<DataSourceBadgeProps>(
    dataSourceBadgeDef,
  )
export const MetabuilderDataDataTable =
  createJsonComponent<DataTableProps<any>>(dataTableDef)
export const MetabuilderWidgetDetailRow =
  createJsonComponent<DetailRowProps>(detailRowDef)
export const MetabuilderDisplayDivider =
  createJsonComponent<DividerProps>(dividerDef)
export const MetabuilderWidgetDot =
  createJsonComponent<DotProps>(dotDef)
export const MetabuilderFeedbackEmptyMessage =
  createJsonComponent<EmptyMessageProps>(emptyMessageDef)
export const MetabuilderFeedbackEmptyState =
  createJsonComponent<EmptyStateProps>(emptyStateDef)
export const MetabuilderFeedbackEmptyStateIcon =
  createJsonComponent<EmptyStateIconProps>(emptyStateIconDef)
export const MetabuilderFeedbackErrorBadge =
  createJsonComponent<ErrorBadgeProps>(errorBadgeDef)
