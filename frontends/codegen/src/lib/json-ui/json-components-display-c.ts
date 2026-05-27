/**
 * Display components M–S: metrics, progress, scroll, skeleton, stat.
 */
import { createJsonComponent } from './create-json-component'
import type {
  MetricCardProps, MetricDisplayProps, NotificationProps,
  PanelHeaderProps, ProgressBarProps, ProgressProps,
  PropertyEditorFieldProps, PulseProps, RatingProps,
  ScrollAreaProps, ScrollAreaThumbProps, SeedDataStatusProps,
  SeparatorProps, SkeletonProps, SparkleProps, SpinnerProps,
  StatCardProps, StatusBadgeProps, StatusIconProps,
} from './interfaces'
import metricCardDef from
  '@/components/json-definitions/metric-card.json'
import metricDisplayDef from
  '@/components/json-definitions/metric-display.json'
import notificationDef from
  '@/components/json-definitions/notification.json'
import panelHeaderDef from
  '@/components/json-definitions/panel-header.json'
import progressDef from
  '@/components/json-definitions/progress.json'
import progressBarDef from
  '@/components/json-definitions/progress-bar.json'
import propertyEditorFieldDef from
  '@/components/json-definitions/property-editor-field.json'
import pulseDef from '@/components/json-definitions/pulse.json'
import ratingDef from '@/components/json-definitions/rating.json'
import scrollAreaDef from
  '@/components/json-definitions/scroll-area.json'
import scrollAreaThumbDef from
  '@/components/json-definitions/scroll-area-thumb.json'
import seedDataStatusDef from
  '@/components/json-definitions/seed-data-status.json'
import separatorDef from
  '@/components/json-definitions/separator.json'
import skeletonDef from
  '@/components/json-definitions/skeleton.json'
import sparkleDef from
  '@/components/json-definitions/sparkle.json'
import spinnerDef from
  '@/components/json-definitions/spinner.json'
import statCardDef from
  '@/components/json-definitions/stat-card.json'
import statusBadgeDef from
  '@/components/json-definitions/status-badge.json'
import statusIconDef from
  '@/components/json-definitions/status-icon.json'

export const MetabuilderDataMetricCard =
  createJsonComponent<MetricCardProps>(metricCardDef)
export const MetabuilderDataMetricDisplay =
  createJsonComponent<MetricDisplayProps>(metricDisplayDef)
export const MetabuilderFeedbackNotification =
  createJsonComponent<NotificationProps>(notificationDef)
export const MetabuilderWidgetPanelHeader =
  createJsonComponent<PanelHeaderProps>(panelHeaderDef)
export const Progress =
  createJsonComponent<ProgressProps>(progressDef)
export const MetabuilderDisplayProgressBar =
  createJsonComponent<ProgressBarProps>(progressBarDef)
export const MetabuilderWidgetPropertyEditorField =
  createJsonComponent<PropertyEditorFieldProps>(
    propertyEditorFieldDef,
  )
export const MetabuilderWidgetPulse =
  createJsonComponent<PulseProps>(pulseDef)
export const MetabuilderWidgetRating =
  createJsonComponent<RatingProps>(ratingDef)
export const MetabuilderWidgetScrollArea =
  createJsonComponent<ScrollAreaProps>(scrollAreaDef)
export const MetabuilderDisplayScrollAreaThumb =
  createJsonComponent<ScrollAreaThumbProps>(
    scrollAreaThumbDef,
  )
export const MetabuilderFeedbackSeedDataStatus =
  createJsonComponent<SeedDataStatusProps>(seedDataStatusDef)
export const MetabuilderDisplaySeparator =
  createJsonComponent<SeparatorProps>(separatorDef)
export const MetabuilderDisplaySkeleton =
  createJsonComponent<SkeletonProps>(skeletonDef)
export const MetabuilderWidgetSparkle =
  createJsonComponent<SparkleProps>(sparkleDef)
export const MetabuilderDisplaySpinner =
  createJsonComponent<SpinnerProps>(spinnerDef)
export const MetabuilderDataStatCard =
  createJsonComponent<StatCardProps>(statCardDef)
export const MetabuilderFeedbackStatusBadge =
  createJsonComponent<StatusBadgeProps>(statusBadgeDef)
export const MetabuilderFeedbackStatusIcon =
  createJsonComponent<StatusIconProps>(statusIconDef)
