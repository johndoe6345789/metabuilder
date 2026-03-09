/**
 * Pure JSON components - no TypeScript wrappers needed
 * Interfaces are defined in src/lib/json-ui/interfaces/
 * JSON definitions are in src/components/json-definitions/
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from './create-json-component-with-hooks'
import type {
  BindingIndicatorProps,
  ButtonGroupProps,
  ChipProps,
  CircularProgressProps,
  CodeProps,
  CommandPaletteProps,
  CompletionCardProps,
  ComponentPaletteItemProps,
  ConfirmButtonProps,
  DataSourceBadgeProps,
  DataTableProps,
  LoadingFallbackProps,
  NavigationItemProps,
  PageHeaderContentProps,
  PageHeaderProps,
  SaveIndicatorProps,
  LazyBarChartProps,
  LazyLineChartProps,
  LazyD3BarChartProps,
  SeedDataManagerProps,
  StorageSettingsProps,
  GitHubBuildStatusProps,
  ComponentBindingDialogProps,
  DataSourceEditorDialogProps,
  ComponentTreeProps,
  ComponentTreeBuilderProps,
  TreeCardProps,
  FilterInputProps,
  CopyButtonProps,
  ConditionalWrapperProps,
  InputProps,
  PasswordInputProps,
  ImageProps,
  DataCardProps,
  RepeatWrapperProps,
  PopoverProps,
  MenuProps,
  FileUploadProps,
  AccordionProps,
  BindingEditorProps,
  IconRendererProps,
  DynamicTextProps,
  AppLayoutProps,
  AppRouterLayoutProps,
  AppMainPanelProps,
  AppDialogsProps,
  DataSourceManagerProps,
  NavigationMenuProps,
  TreeListPanelProps,
  SchemaEditorCanvasProps,
  SchemaEditorLayoutProps,
  SchemaEditorPropertiesPanelProps,
  SchemaEditorSidebarProps,
  SchemaEditorStatusBarProps,
  SchemaEditorToolbarProps,
  ActionButtonProps,
  ActionCardProps,
  ActionIconProps,
  AlertProps,
  AppLogoProps,
  AvatarProps,
  AvatarGroupProps,
  BadgeProps,
  BreadcrumbProps,
  ButtonProps,
  CalendarProps,
  CardProps,
  CheckboxProps,
  ContextMenuProps,
  DatePickerProps,
  DetailRowProps,
  DialogProps,
  DividerProps,
  DrawerProps,
  DropdownMenuProps,
  EmptyMessageProps,
  ErrorBadgeProps,
  FileIconProps,
  FormProps,
  FormFieldProps,
  GlowCardProps,
  HeadingProps,
  HelperTextProps,
  HoverCardProps,
  IconProps,
  InputOTPProps,
  LabelProps,
  PaginationProps,
  PanelProps,
  ProgressProps,
  ProgressBarProps,
  PulseProps,
  QuickActionButtonProps,
  RadioGroupProps,
  RangeSliderProps,
  RatingProps,
  ScrollAreaProps,
  ScrollAreaThumbProps,
  SearchInputProps,
  SeedDataStatusProps,
  SelectProps,
  SeparatorProps,
  SkeletonProps,
  SliderProps,
  SparkleProps,
  SpinnerProps,
  StatusIconProps,
  StepIndicatorProps,
  StepperProps,
  SwitchProps,
  TableProps,
  TabsProps,
  TagProps,
  TextAreaProps,
  TextGradientProps,
  TextHighlightProps,
  TimelineProps,
  TimestampProps,
  ToggleProps,
  TooltipProps,
  TabIconProps,
  TipsCardProps,
  InfoBoxProps,
  KeyValueProps,
  LiveIndicatorProps,
  ListProps,
  ListItemProps,
  LoadingSpinnerProps,
  LoadingStateProps,
  MetricDisplayProps,
  ModalProps,
  NotificationProps,
  NumberInputProps,
  AppBrandingProps,
  DataSourceCardProps,
  CodeExplanationDialogProps,
  ComponentPaletteProps,
  CanvasRendererProps,
  EmptyCanvasStateProps,
  SchemaCodeViewerProps,
  ToolbarActionsProps,
  AppHeaderProps,
  ColorSwatchProps,
  ComponentTreeNodeProps,
  ContainerProps,
  CountBadgeProps,
  DataListProps,
  DotProps,
  EmptyStateProps,
  EmptyStateIconProps,
  FlexLayoutProps,
  GridLayoutProps,
  FlexProps,
  GridProps,
  IconButtonProps,
  IconTextProps,
  IconWrapperProps,
  InfoPanelProps,
  KbdProps,
  LinkProps,
  MetricCardProps,
  PanelHeaderProps,
  PropertyEditorFieldProps,
  ResponsiveGridProps,
  SectionProps,
  SpacerProps,
  StackProps,
  StatCardProps,
  StatusBadgeProps,
  TextProps,
  TreeIconProps,
  ErrorPanelHeaderProps,
  ErrorPanelEmptyStateProps,
  PWAUpdateSectionProps,
  PWACacheSectionProps,
  ConflictResolutionStatsProps,
  ConflictResolutionDemoProps,
  ConflictResolutionPageProps,
  HowItWorksCardProps,
  SearchResultsProps,
  SearchEmptyStateProps,
  ComprehensiveDemoHeaderProps,
  ComprehensiveDemoStatsRowProps,
  ConfigCardProps,
  StatusCardProps,
  InfoSectionProps,
  ListHeaderProps,
  SchemaEditorPageProps,
  KeyboardShortcutsDialogProps,
  PreloadIndicatorProps,
  PWAStatusBarProps,
  PWAUpdatePromptProps,
  PWAInstallPromptProps,
  ConflictCardProps,
  ConflictDetailsDialogProps,
  ConflictIndicatorProps,
  ErrorPanelProps,
  PreviewDialogProps,
  NotFoundPageProps,
  GlobalSearchProps,
  FileExplorerProps,
  JSONFlaskDesignerProps,
  JSONStyleDesignerProps,
  ComponentTreeDemoPageProps,
  JSONConversionShowcaseProps,
  JSONLambdaDesignerProps,
  JSONModelDesignerProps,
  JSONWorkflowDesignerProps,
  JSONComponentTreeManagerProps,
  SassStylesShowcaseProps,
  AtomicComponentShowcaseProps,
  JSONUIShowcasePageProps,
  JSONDemoPageProps,
  DashboardDemoPageProps,
  ComprehensiveDemoPageProps,
  TemplateExplorerProps,
  ProjectManagerProps,
  DBALSearchInputProps,
  QuickSeedButtonProps,
  HeaderSearchProps,
  TranslationEditorProps,
  StorageSettingsPanelProps,
  FeatureToggleSettingsProps,
  DocumentationViewProps,
  DockerBuildDebuggerProps,
  DataBindingDesignerProps,
  ErrorPanelMainProps,
  FaviconDesignerProps,
  FeatureIdeaCloudProps,
  NavigationGroupHeaderProps,
  PersistenceDashboardProps,
  CodeEditorProps,
  PlaywrightDesignerProps,
  UnitTestDesignerProps,
  StorybookDesignerProps,
  PWASettingsProps,
  TemplateSelectorProps,
  PersistenceExampleProps,
  AtomicLibraryShowcaseProps,
  ProjectSettingsDesignerProps,
} from './interfaces'

// Import JSON definitions
import bindingIndicatorDef from '@/components/json-definitions/binding-indicator.json'
import buttonGroupDef from '@/components/json-definitions/button-group.json'
import chipDef from '@/components/json-definitions/chip.json'
import circularProgressDef from '@/components/json-definitions/circular-progress.json'
import codeDef from '@/components/json-definitions/code.json'
import commandPaletteDef from '@/components/json-definitions/command-palette.json'
import completionCardDef from '@/components/json-definitions/completion-card.json'
import componentPaletteItemDef from '@/components/json-definitions/component-palette-item.json'
import confirmButtonDef from '@/components/json-definitions/confirm-button.json'
import dataSourceBadgeDef from '@/components/json-definitions/data-source-badge.json'
import dataTableDef from '@/components/json-definitions/data-table.json'
import loadingFallbackDef from '@/components/json-definitions/loading-fallback.json'
import navigationItemDef from '@/components/json-definitions/navigation-item.json'
import pageHeaderContentDef from '@/components/json-definitions/page-header-content.json'
import pageHeaderDef from '@/components/json-definitions/page-header.json'
import componentBindingDialogDef from '@/components/json-definitions/component-binding-dialog.json'
import dataSourceEditorDialogDef from '@/components/json-definitions/data-source-editor-dialog.json'
import githubBuildStatusDef from '@/components/json-definitions/github-build-status.json'
import saveIndicatorDef from '@/components/json-definitions/save-indicator.json'
import componentTreeDef from '@/components/json-definitions/component-tree.json'
import componentTreeBuilderDef from '@/components/json-definitions/component-tree-builder.json'
import seedDataManagerDef from '@/components/json-definitions/seed-data-manager.json'
import lazyD3BarChartDef from '@/components/json-definitions/lazy-d3-bar-chart.json'
import storageSettingsDef from '@/components/json-definitions/storage-settings.json'
import treeCardDef from '@/components/json-definitions/tree-card.json'
import filterInputDef from '@/components/json-definitions/filter-input.json'
import copyButtonDef from '@/components/json-definitions/copy-button.json'
import conditionalWrapperDef from '@/components/json-definitions/conditional-wrapper.json'
import inputDef from '@/components/json-definitions/input.json'
import passwordInputDef from '@/components/json-definitions/password-input.json'
import imageDef from '@/components/json-definitions/image.json'
import dataCardDef from '@/components/json-definitions/data-card.json'
import repeatWrapperDef from '@/components/json-definitions/repeat-wrapper.json'
import popoverDef from '@/components/json-definitions/popover.json'
import menuDef from '@/components/json-definitions/menu.json'
import fileUploadDef from '@/components/json-definitions/file-upload.json'
import accordionDef from '@/components/json-definitions/accordion.json'
import bindingEditorDef from '@/components/json-definitions/binding-editor.json'
import iconRendererDef from '@/components/json-definitions/icon-renderer.json'
import dynamicTextDef from '@/components/json-definitions/dynamic-text.json'
import appLayoutDef from '@/components/json-definitions/app-layout.json'
import appRouterLayoutDef from '@/components/json-definitions/app-router-layout.json'
import appMainPanelDef from '@/components/json-definitions/app-main-panel.json'
import appDialogsDef from '@/components/json-definitions/app-dialogs.json'
import navigationMenuDef from '@/components/json-definitions/navigation-menu.json'
import dataSourceManagerDef from '@/components/json-definitions/data-source-manager.json'
import treeListPanelDef from '@/components/json-definitions/tree-list-panel.json'
import actionButtonDef from '@/components/json-definitions/action-button.json'
import actionCardDef from '@/components/json-definitions/action-card.json'
import actionIconDef from '@/components/json-definitions/action-icon.json'
import alertDef from '@/components/json-definitions/alert.json'
import appLogoDef from '@/components/json-definitions/app-logo.json'
import avatarDef from '@/components/json-definitions/avatar.json'
import avatarGroupDef from '@/components/json-definitions/avatar-group.json'
import badgeDef from '@/components/json-definitions/badge.json'
import breadcrumbDef from '@/components/json-definitions/breadcrumb.json'
import buttonDef from '@/components/json-definitions/button.json'
import calendarDef from '@/components/json-definitions/calendar.json'
import cardDef from '@/components/json-definitions/card.json'
import checkboxDef from '@/components/json-definitions/checkbox.json'
import contextMenuDef from '@/components/json-definitions/context-menu.json'
import dialogDef from '@/components/json-definitions/dialog.json'
import drawerDef from '@/components/json-definitions/drawer.json'
import datePickerDef from '@/components/json-definitions/date-picker.json'
import detailRowDef from '@/components/json-definitions/detail-row.json'
import dividerDef from '@/components/json-definitions/divider.json'
import emptyMessageDef from '@/components/json-definitions/empty-message.json'
import errorBadgeDef from '@/components/json-definitions/error-badge.json'
import fileIconDef from '@/components/json-definitions/file-icon.json'
import formDef from '@/components/json-definitions/form.json'
import glowCardDef from '@/components/json-definitions/glow-card.json'
import helperTextDef from '@/components/json-definitions/helper-text.json'
import dropdownMenuDef from '@/components/json-definitions/dropdown-menu.json'
import formFieldDef from '@/components/json-definitions/form-field.json'
import headingDef from '@/components/json-definitions/heading.json'
import hoverCardDef from '@/components/json-definitions/hover-card.json'
import iconDef from '@/components/json-definitions/icon.json'
import inputOtpDef from '@/components/json-definitions/input-otp.json'
import labelDef from '@/components/json-definitions/label.json'
import paginationDef from '@/components/json-definitions/pagination.json'
import panelDef from '@/components/json-definitions/panel.json'
import progressDef from '@/components/json-definitions/progress.json'
import progressBarDef from '@/components/json-definitions/progress-bar.json'
import pulseDef from '@/components/json-definitions/pulse.json'
import quickActionButtonDef from '@/components/json-definitions/quick-action-button.json'
import radioGroupDef from '@/components/json-definitions/radio-group.json'
import rangeSliderDef from '@/components/json-definitions/range-slider.json'
import ratingDef from '@/components/json-definitions/rating.json'
import scrollAreaDef from '@/components/json-definitions/scroll-area.json'
import scrollAreaThumbDef from '@/components/json-definitions/scroll-area-thumb.json'
import searchInputDef from '@/components/json-definitions/search-input.json'
import seedDataStatusDef from '@/components/json-definitions/seed-data-status.json'
import selectDef from '@/components/json-definitions/select.json'
import separatorDef from '@/components/json-definitions/separator.json'
import skeletonDef from '@/components/json-definitions/skeleton.json'
import sliderDef from '@/components/json-definitions/slider.json'
import sparkleDef from '@/components/json-definitions/sparkle.json'
import spinnerDef from '@/components/json-definitions/spinner.json'
import statusIconDef from '@/components/json-definitions/status-icon.json'
import stepIndicatorDef from '@/components/json-definitions/step-indicator.json'
import stepperDef from '@/components/json-definitions/stepper.json'
import switchDef from '@/components/json-definitions/switch.json'
import tableDef from '@/components/json-definitions/table.json'
import tabsDef from '@/components/json-definitions/tabs.json'
import tagDef from '@/components/json-definitions/tag.json'
import textareaDef from '@/components/json-definitions/textarea.json'
import textGradientDef from '@/components/json-definitions/text-gradient.json'
import textHighlightDef from '@/components/json-definitions/text-highlight.json'
import timelineDef from '@/components/json-definitions/timeline.json'
import timestampDef from '@/components/json-definitions/timestamp.json'
import toggleDef from '@/components/json-definitions/toggle.json'
import tooltipDef from '@/components/json-definitions/tooltip.json'
import tabIconDef from '@/components/json-definitions/tab-icon.json'
import tipsCardDef from '@/components/json-definitions/tips-card.json'
import infoBoxDef from '@/components/json-definitions/info-box.json'
import keyValueDef from '@/components/json-definitions/key-value.json'
import liveIndicatorDef from '@/components/json-definitions/live-indicator.json'
import listDef from '@/components/json-definitions/list.json'
import listItemDef from '@/components/json-definitions/list-item.json'
import loadingSpinnerDef from '@/components/json-definitions/loading-spinner.json'
import loadingStateDef from '@/components/json-definitions/loading-state.json'
import metricDisplayDef from '@/components/json-definitions/metric-display.json'
import modalDef from '@/components/json-definitions/modal.json'
import notificationDef from '@/components/json-definitions/notification.json'
import numberInputDef from '@/components/json-definitions/number-input.json'
import appBrandingDef from '@/components/json-definitions/app-branding.json'
import dataSourceCardDef from '@/components/json-definitions/data-source-card.json'
import codeExplanationDialogDef from '@/components/json-definitions/code-explanation-dialog.json'
import componentPaletteDef from '@/components/json-definitions/component-palette.json'
import canvasRendererDef from '@/components/json-definitions/canvas-renderer.json'
import emptyCanvasStateDef from '@/components/json-definitions/empty-canvas-state.json'
import schemaCodeViewerDef from '@/components/json-definitions/schema-code-viewer.json'
import toolbarActionsDef from '@/components/json-definitions/toolbar-actions.json'
import appHeaderDef from '@/components/json-definitions/app-header.json'
import schemaEditorCanvasDef from '@/components/json-definitions/schema-editor-canvas.json'
import schemaEditorLayoutDef from '@/components/json-definitions/schema-editor-layout.json'
import schemaEditorPropertiesPanelDef from '@/components/json-definitions/schema-editor-properties-panel.json'
import schemaEditorSidebarDef from '@/components/json-definitions/schema-editor-sidebar.json'
import schemaEditorStatusBarDef from '@/components/json-definitions/schema-editor-status-bar.json'
import schemaEditorToolbarDef from '@/components/json-definitions/schema-editor-toolbar.json'
import colorSwatchDef from '@/components/json-definitions/color-swatch.json'
import componentTreeNodeDef from '@/components/json-definitions/component-tree-node.json'
import containerDef from '@/components/json-definitions/container.json'
import countBadgeDef from '@/components/json-definitions/count-badge.json'
import dataListDef from '@/components/json-definitions/data-list.json'
import dotDef from '@/components/json-definitions/dot.json'
import emptyStateDef from '@/components/json-definitions/empty-state.json'
import emptyStateIconDef from '@/components/json-definitions/empty-state-icon.json'
import flexDef from '@/components/json-definitions/flex.json'
import flexLayoutDef from '@/components/json-definitions/flex-layout.json'
import gridLayoutDef from '@/components/json-definitions/grid-layout.json'
import gridDef from '@/components/json-definitions/grid.json'
import iconButtonDef from '@/components/json-definitions/icon-button.json'
import iconTextDef from '@/components/json-definitions/icon-text.json'
import iconWrapperDef from '@/components/json-definitions/icon-wrapper.json'
import infoPanelDef from '@/components/json-definitions/info-panel.json'
import kbdDef from '@/components/json-definitions/kbd.json'
import linkDef from '@/components/json-definitions/link.json'
import metricCardDef from '@/components/json-definitions/metric-card.json'
import panelHeaderDef from '@/components/json-definitions/panel-header.json'
import propertyEditorFieldDef from '@/components/json-definitions/property-editor-field.json'
import responsiveGridDef from '@/components/json-definitions/responsive-grid.json'
import sectionDef from '@/components/json-definitions/section.json'
import spacerDef from '@/components/json-definitions/spacer.json'
import stackDef from '@/components/json-definitions/stack.json'
import statCardDef from '@/components/json-definitions/stat-card.json'
import statusBadgeDef from '@/components/json-definitions/status-badge.json'
import textDef from '@/components/json-definitions/text.json'
import treeIconDef from '@/components/json-definitions/tree-icon.json'

import errorPanelHeaderDef from '@/components/json-definitions/error-panel-header.json'
import errorPanelEmptyStateDef from '@/components/json-definitions/error-panel-empty-state.json'
import pwaUpdateSectionDef from '@/components/json-definitions/pwa-update-section.json'
import pwaCacheSectionDef from '@/components/json-definitions/pwa-cache-section.json'
import conflictResolutionStatsDef from '@/components/json-definitions/conflict-resolution-stats.json'
import howItWorksCardDef from '@/components/json-definitions/how-it-works-card.json'
import searchResultsDef from '@/components/json-definitions/search-results.json'
import searchEmptyStateDef from '@/components/json-definitions/search-empty-state.json'
import comprehensiveDemoHeaderDef from '@/components/json-definitions/comprehensive-demo-header.json'
import comprehensiveDemoStatsRowDef from '@/components/json-definitions/comprehensive-demo-stats-row.json'
import configCardDef from '@/components/json-definitions/config-card.json'
import statusCardDef from '@/components/json-definitions/status-card.json'
import infoSectionDef from '@/components/json-definitions/info-section.json'
import listHeaderDef from '@/components/json-definitions/list-header.json'
import schemaEditorPageDef from '@/components/json-definitions/schema-editor-page.json'
import keyboardShortcutsDialogDef from '@/components/json-definitions/keyboard-shortcuts-dialog.json'
import preloadIndicatorDef from '@/components/json-definitions/preload-indicator.json'
import pwaStatusBarDef from '@/components/json-definitions/pwa-status-bar.json'
import pwaUpdatePromptDef from '@/components/json-definitions/pwa-update-prompt.json'
import pwaInstallPromptDef from '@/components/json-definitions/pwa-install-prompt.json'
import conflictCardDef from '@/components/json-definitions/conflict-card.json'
import conflictDetailsDialogDef from '@/components/json-definitions/conflict-details-dialog.json'
import conflictIndicatorDef from '@/components/json-definitions/conflict-indicator.json'
import conflictResolutionDemoDef from '@/components/json-definitions/conflict-resolution-demo.json'
import conflictResolutionPageDef from '@/components/json-definitions/conflict-resolution-page.json'
import errorPanelDef from '@/components/json-definitions/error-panel.json'
import previewDialogDef from '@/components/json-definitions/preview-dialog.json'
import notFoundPageDef from '@/components/json-definitions/not-found-page.json'
import globalSearchDef from '@/components/json-definitions/global-search.json'
import fileExplorerDef from '@/components/json-definitions/file-explorer.json'
import jsonFlaskDesignerDef from '@/components/json-definitions/json-flask-designer.json'
import jsonStyleDesignerDef from '@/components/json-definitions/json-style-designer.json'
import componentTreeDemoPageDef from '@/components/json-definitions/component-tree-demo-page.json'
import jsonConversionShowcaseDef from '@/components/json-definitions/json-conversion-showcase.json'
import jsonLambdaDesignerDef from '@/components/json-definitions/json-lambda-designer.json'
import jsonModelDesignerDef from '@/components/json-definitions/json-model-designer.json'
import jsonWorkflowDesignerDef from '@/components/json-definitions/json-workflow-designer.json'
import jsonComponentTreeManagerDef from '@/components/json-definitions/json-component-tree-manager.json'
import sassStylesShowcaseDef from '@/components/json-definitions/sass-styles-showcase.json'
import atomicComponentShowcaseDef from '@/components/json-definitions/atomic-component-showcase.json'
import jsonUiShowcasePageDef from '@/components/json-definitions/json-ui-showcase-page.json'
import jsonDemoPageDef from '@/components/json-definitions/json-demo-page.json'
import dashboardDemoPageDef from '@/components/json-definitions/dashboard-demo-page.json'
import comprehensiveDemoPageDef from '@/components/json-definitions/comprehensive-demo-page.json'
import templateExplorerDef from '@/components/json-definitions/template-explorer.json'
import projectManagerDef from '@/components/json-definitions/project-manager.json'
import dbalSearchInputDef from '@/components/json-definitions/dbal-search-input.json'
import headerSearchDef from '@/components/json-definitions/header-search.json'
import translationEditorDef from '@/components/json-definitions/translation-editor.json'
import quickSeedButtonDef from '@/components/json-definitions/quick-seed-button.json'
import storageSettingsPanelDef from '@/components/json-definitions/storage-settings-panel.json'
import featureToggleSettingsDef from '@/components/json-definitions/feature-toggle-settings.json'
import documentationViewDef from '@/components/json-definitions/documentation-view.json'
import dockerBuildDebuggerDef from '@/components/json-definitions/docker-build-debugger.json'
import dataBindingDesignerDef from '@/components/json-definitions/data-binding-designer.json'
import errorPanelMainDef from '@/components/json-definitions/error-panel-main.json'
import faviconDesignerDef from '@/components/json-definitions/favicon-designer.json'
import featureIdeaCloudDef from '@/components/json-definitions/feature-idea-cloud.json'
import lazyBarChartDef from '@/components/json-definitions/lazy-bar-chart.json'
import lazyLineChartDef from '@/components/json-definitions/lazy-line-chart.json'
import navigationGroupHeaderDef from '@/components/json-definitions/navigation-group-header.json'
import persistenceDashboardDef from '@/components/json-definitions/persistence-dashboard.json'
import codeEditorDef from '@/components/json-definitions/code-editor.json'
import playwrightDesignerDef from '@/components/json-definitions/playwright-designer.json'
import unitTestDesignerDef from '@/components/json-definitions/unit-test-designer.json'
import storybookDesignerDef from '@/components/json-definitions/storybook-designer.json'
import pwaSettingsDef from '@/components/json-definitions/pwa-settings.json'
import templateSelectorDef from '@/components/json-definitions/template-selector.json'
import persistenceExampleDef from '@/components/json-definitions/persistence-example.json'
import projectSettingsDesignerDef from '@/components/json-definitions/project-settings-designer.json'
import atomicLibraryShowcaseDef from '@/components/json-definitions/atomic-library-showcase.json'

// Create pure JSON components (no hooks)
export const MetabuilderWidgetBindingIndicator = createJsonComponent<BindingIndicatorProps>(bindingIndicatorDef)
export const MetabuilderFormButtonGroup = createJsonComponent<ButtonGroupProps>(buttonGroupDef)
export const MetabuilderWidgetChip = createJsonComponent<ChipProps>(chipDef)
export const MetabuilderDisplayCircularProgress = createJsonComponent<CircularProgressProps>(circularProgressDef)
export const MetabuilderDisplayCode = createJsonComponent<CodeProps>(codeDef)
export const MetabuilderLayoutConditionalWrapper = createJsonComponent<ConditionalWrapperProps>(conditionalWrapperDef)
export const MetabuilderWidgetCommandPalette = createJsonComponent<CommandPaletteProps>(commandPaletteDef)
export const MetabuilderLayoutCompletionCard = createJsonComponent<CompletionCardProps>(completionCardDef)
export const MetabuilderWidgetComponentPaletteItem = createJsonComponent<ComponentPaletteItemProps>(componentPaletteItemDef)
export const MetabuilderFormConfirmButton = createJsonComponent<ConfirmButtonProps>(confirmButtonDef)
export const MetabuilderFeedbackDataSourceBadge = createJsonComponent<DataSourceBadgeProps>(dataSourceBadgeDef)
export const MetabuilderDataDataTable = createJsonComponent<DataTableProps<any>>(dataTableDef)
export const MetabuilderFeedbackLoadingFallback = createJsonComponent<LoadingFallbackProps>(loadingFallbackDef)
export const MetabuilderNavNavigationItem = createJsonComponent<NavigationItemProps>(navigationItemDef)
export const MetabuilderWidgetPageHeaderContent = createJsonComponent<PageHeaderContentProps>(pageHeaderContentDef)
export const MetabuilderWidgetPageHeader = createJsonComponent<PageHeaderProps>(pageHeaderDef)
export const MetabuilderLayoutComponentBindingDialog = createJsonComponent<ComponentBindingDialogProps>(componentBindingDialogDef)
export const MetabuilderLayoutDataSourceEditorDialog = createJsonComponent<DataSourceEditorDialogProps>(dataSourceEditorDialogDef)
export const MetabuilderFeedbackGitHubBuildStatus = createJsonComponent<GitHubBuildStatusProps>(githubBuildStatusDef)
export const MetabuilderDataSeedDataManager = createJsonComponent<SeedDataManagerProps>(seedDataManagerDef)
export const MetabuilderLayoutTreeCard = createJsonComponent<TreeCardProps>(treeCardDef)
export const MetabuilderWidgetAppDialogs = createJsonComponent<AppDialogsProps>(appDialogsDef)
export const MetabuilderFormActionButton = createJsonComponent<ActionButtonProps>(actionButtonDef)
export const MetabuilderLayoutActionCard = createJsonComponent<ActionCardProps>(actionCardDef)
export const MetabuilderDisplayActionIcon = createJsonComponent<ActionIconProps>(actionIconDef)
export const MetabuilderFeedbackAlert = createJsonComponent<AlertProps>(alertDef)
export const MetabuilderWidgetAppLogo = createJsonComponent<AppLogoProps>(appLogoDef)
export const MetabuilderDisplayAvatar = createJsonComponent<AvatarProps>(avatarDef)
export const MetabuilderDisplayAvatarGroup = createJsonComponent<AvatarGroupProps>(avatarGroupDef)
export const MetabuilderDisplayBadge = createJsonComponent<BadgeProps>(badgeDef)
export const MetabuilderNavBreadcrumb = createJsonComponent<BreadcrumbProps>(breadcrumbDef)
export const MetabuilderFormButton = createJsonComponent<ButtonProps>(buttonDef)
export const MetabuilderWidgetCalendar = createJsonComponent<CalendarProps>(calendarDef)
export const MetabuilderLayoutCard = createJsonComponent<CardProps>(cardDef)
export const MetabuilderFormCheckbox = createJsonComponent<CheckboxProps>(checkboxDef)
export const MetabuilderNavContextMenu = createJsonComponent<ContextMenuProps>(contextMenuDef)
export const MetabuilderFormDatePicker = createJsonComponent<DatePickerProps>(datePickerDef)
export const MetabuilderWidgetDetailRow = createJsonComponent<DetailRowProps>(detailRowDef)
export const Dialog = createJsonComponent<DialogProps>(dialogDef)
export const MetabuilderLayoutDrawer = createJsonComponent<DrawerProps>(drawerDef)
export const MetabuilderDisplayDivider = createJsonComponent<DividerProps>(dividerDef)
export const DropdownMenu = createJsonComponent<DropdownMenuProps>(dropdownMenuDef)
export const MetabuilderFeedbackEmptyMessage = createJsonComponent<EmptyMessageProps>(emptyMessageDef)
export const MetabuilderFeedbackErrorBadge = createJsonComponent<ErrorBadgeProps>(errorBadgeDef)
export const MetabuilderDisplayFileIcon = createJsonComponent<FileIconProps>(fileIconDef)
export const MetabuilderFormForm = createJsonComponent<FormProps>(formDef)
export const MetabuilderFormFormField = createJsonComponent<FormFieldProps>(formFieldDef)
export const MetabuilderLayoutGlowCard = createJsonComponent<GlowCardProps>(glowCardDef)
export const MetabuilderDisplayHeading = createJsonComponent<HeadingProps>(headingDef)
export const MetabuilderDisplayHelperText = createJsonComponent<HelperTextProps>(helperTextDef)
export const MetabuilderLayoutHoverCard = createJsonComponent<HoverCardProps>(hoverCardDef)
export const MetabuilderDisplayIcon = createJsonComponent<IconProps>(iconDef)
export const MetabuilderFormInputOTP = createJsonComponent<InputOTPProps>(inputOtpDef)
export const MetabuilderDisplayLabel = createJsonComponent<LabelProps>(labelDef)
export const Pagination = createJsonComponent<PaginationProps>(paginationDef)
export const MetabuilderLayoutPanel = createJsonComponent<PanelProps>(panelDef)
export const Progress = createJsonComponent<ProgressProps>(progressDef)
export const MetabuilderDisplayProgressBar = createJsonComponent<ProgressBarProps>(progressBarDef)
export const MetabuilderWidgetPulse = createJsonComponent<PulseProps>(pulseDef)
export const MetabuilderFormQuickActionButton = createJsonComponent<QuickActionButtonProps>(quickActionButtonDef)
export const MetabuilderFormRadioGroup = createJsonComponent<RadioGroupProps>(radioGroupDef)
export const MetabuilderWidgetSparkle = createJsonComponent<SparkleProps>(sparkleDef)
export const MetabuilderFormRangeSlider = createJsonComponent<RangeSliderProps>(rangeSliderDef)
export const MetabuilderWidgetRating = createJsonComponent<RatingProps>(ratingDef)
export const MetabuilderWidgetScrollArea = createJsonComponent<ScrollAreaProps>(scrollAreaDef)
export const MetabuilderDisplayScrollAreaThumb = createJsonComponent<ScrollAreaThumbProps>(scrollAreaThumbDef)
export const MetabuilderWidgetSearchInput = createJsonComponent<SearchInputProps>(searchInputDef)
export const MetabuilderFeedbackSeedDataStatus = createJsonComponent<SeedDataStatusProps>(seedDataStatusDef)
export const MetabuilderFormSelect = createJsonComponent<SelectProps>(selectDef)
export const MetabuilderDisplaySeparator = createJsonComponent<SeparatorProps>(separatorDef)
export const MetabuilderDisplaySkeleton = createJsonComponent<SkeletonProps>(skeletonDef)
export const MetabuilderFormSlider = createJsonComponent<SliderProps>(sliderDef)
export const MetabuilderDisplaySpinner = createJsonComponent<SpinnerProps>(spinnerDef)
export const MetabuilderFeedbackStatusIcon = createJsonComponent<StatusIconProps>(statusIconDef)
export const MetabuilderWidgetStepIndicator = createJsonComponent<StepIndicatorProps>(stepIndicatorDef)
export const MetabuilderWidgetStepper = createJsonComponent<StepperProps>(stepperDef)
export const MetabuilderFormSwitch = createJsonComponent<SwitchProps>(switchDef)
export const MetabuilderDataTable = createJsonComponent<TableProps>(tableDef)
export const MetabuilderNavTabs = createJsonComponent<TabsProps>(tabsDef)
export const MetabuilderDisplayTag = createJsonComponent<TagProps>(tagDef)
export const MetabuilderFormTextArea = createJsonComponent<TextAreaProps>(textareaDef)
export const MetabuilderDisplayTextGradient = createJsonComponent<TextGradientProps>(textGradientDef)
export const MetabuilderDisplayTextHighlight = createJsonComponent<TextHighlightProps>(textHighlightDef)
export const MetabuilderDataTimeline = createJsonComponent<TimelineProps>(timelineDef)
export const MetabuilderWidgetTimestamp = createJsonComponent<TimestampProps>(timestampDef)
export const MetabuilderFormToggle = createJsonComponent<ToggleProps>(toggleDef)
export const MetabuilderWidgetTooltip = createJsonComponent<TooltipProps>(tooltipDef)
export const MetabuilderNavTabIcon = createJsonComponent<TabIconProps>(tabIconDef)
export const MetabuilderLayoutTipsCard = createJsonComponent<TipsCardProps>(tipsCardDef)
export const MetabuilderFeedbackInfoBox = createJsonComponent<InfoBoxProps>(infoBoxDef)
export const MetabuilderDataKeyValue = createJsonComponent<KeyValueProps>(keyValueDef)
export const MetabuilderWidgetLiveIndicator = createJsonComponent<LiveIndicatorProps>(liveIndicatorDef)
export const MetabuilderDataList = createJsonComponent<ListProps<any>>(listDef)
export const MetabuilderDataListItem = createJsonComponent<ListItemProps>(listItemDef)
export const MetabuilderFeedbackLoadingSpinner = createJsonComponent<LoadingSpinnerProps>(loadingSpinnerDef)
export const MetabuilderFeedbackLoadingState = createJsonComponent<LoadingStateProps>(loadingStateDef)
export const MetabuilderDataMetricDisplay = createJsonComponent<MetricDisplayProps>(metricDisplayDef)
export const MetabuilderLayoutModal = createJsonComponent<ModalProps>(modalDef)
export const MetabuilderFeedbackNotification = createJsonComponent<NotificationProps>(notificationDef)
export const MetabuilderFormNumberInput = createJsonComponent<NumberInputProps>(numberInputDef)
export const MetabuilderWidgetAppBranding = createJsonComponent<AppBrandingProps>(appBrandingDef)
export const MetabuilderLayoutDataSourceCard = createJsonComponent<DataSourceCardProps>(dataSourceCardDef)
export const MetabuilderLayoutCodeExplanationDialog = createJsonComponent<CodeExplanationDialogProps>(codeExplanationDialogDef)
export const MetabuilderWidgetComponentPalette = createJsonComponent<ComponentPaletteProps>(componentPaletteDef)
export const MetabuilderWidgetCanvasRenderer = createJsonComponent<CanvasRendererProps>(canvasRendererDef)
export const MetabuilderFeedbackEmptyCanvasState = createJsonComponent<EmptyCanvasStateProps>(emptyCanvasStateDef)
export const MetabuilderDisplaySchemaCodeViewer = createJsonComponent<SchemaCodeViewerProps>(schemaCodeViewerDef)
export const MetabuilderWidgetToolbarActions = createJsonComponent<ToolbarActionsProps>(toolbarActionsDef)
export const MetabuilderWidgetAppHeader = createJsonComponent<AppHeaderProps>(appHeaderDef)
export const MetabuilderWidgetSchemaEditorCanvas = createJsonComponent<SchemaEditorCanvasProps>(schemaEditorCanvasDef)
export const MetabuilderWidgetSchemaEditorLayout = createJsonComponent<SchemaEditorLayoutProps>(schemaEditorLayoutDef)
export const MetabuilderWidgetSchemaEditorPropertiesPanel = createJsonComponent<SchemaEditorPropertiesPanelProps>(schemaEditorPropertiesPanelDef)
export const MetabuilderWidgetSchemaEditorSidebar = createJsonComponent<SchemaEditorSidebarProps>(schemaEditorSidebarDef)
export const MetabuilderFeedbackSchemaEditorStatusBar = createJsonComponent<SchemaEditorStatusBarProps>(schemaEditorStatusBarDef)
export const MetabuilderWidgetSchemaEditorToolbar = createJsonComponent<SchemaEditorToolbarProps>(schemaEditorToolbarDef)

// Create JSON components with hooks
export const MetabuilderWidgetSaveIndicator = createJsonComponentWithHooks<SaveIndicatorProps>(saveIndicatorDef, {
  hooks: {
    hookData: {
      hookName: 'useSaveIndicator',
      args: (props) => [props.lastSaved ?? null]
    }
  }
})

export const MetabuilderWidgetComponentTree = createJsonComponentWithHooks<ComponentTreeProps>(componentTreeDef, {
  hooks: {
    treeData: {
      hookName: 'useComponentTree',
      args: (props) => [props.components || [], props.selectedId || null]
    }
  }
})

export const MetabuilderWidgetComponentTreeBuilder = createJsonComponentWithHooks<ComponentTreeBuilderProps>(componentTreeBuilderDef, {
  hooks: {
    builderState: {
      hookName: 'useComponentTreeBuilder',
      args: (props) => [{ components: props.components, onComponentsChange: props.onComponentsChange }]
    }
  }
})

export const MetabuilderDataLazyD3BarChart = createJsonComponentWithHooks<LazyD3BarChartProps>(lazyD3BarChartDef, {
  hooks: {
    chartData: {
      hookName: 'useD3BarChart',
      args: (props) => [props.data, props.width, props.height]
    }
  }
})

export const MetabuilderWidgetStorageSettings = createJsonComponentWithHooks<StorageSettingsProps>(storageSettingsDef, {
  hooks: {
    backendInfo: {
      hookName: 'useStorageBackendInfo',
      args: (props) => [props.backend || null]
    }
  }
})

export const MetabuilderFormFilterInput = createJsonComponentWithHooks<FilterInputProps>(filterInputDef, {
  hooks: {
    focusState: {
      hookName: 'useFocusState',
      args: () => []
    }
  }
})

export const MetabuilderFormCopyButton = createJsonComponentWithHooks<CopyButtonProps>(copyButtonDef, {
  hooks: {
    copyState: {
      hookName: 'useCopyState',
      args: (props) => [props.text]
    }
  }
})

export const MetabuilderFormInput = createJsonComponent<InputProps>(inputDef)

export const MetabuilderFormPasswordInput = createJsonComponentWithHooks<PasswordInputProps>(passwordInputDef, {
  hooks: {
    visibility: {
      hookName: 'usePasswordVisibility',
      args: () => []
    }
  }
})

export const MetabuilderDisplayImage = createJsonComponentWithHooks<ImageProps>(imageDef, {
  hooks: {
    imageState: {
      hookName: 'useImageState',
      args: (props) => [props.onLoad, props.onError]
    }
  }
})
export const MetabuilderLayoutDataCard = createJsonComponent<DataCardProps>(dataCardDef)

export const MetabuilderLayoutRepeatWrapper = createJsonComponentWithHooks<RepeatWrapperProps>(repeatWrapperDef, {
  hooks: {
    repeatData: {
      hookName: "useRepeatWrapper",
      args: (props) => [{
        items: props.items,
        render: props.render
      }]
    }
  }
})

export const MetabuilderWidgetPopover = createJsonComponentWithHooks<PopoverProps>(popoverDef, {
  hooks: {
    state: {
      hookName: 'usePopoverState',
      args: () => []
    }
  }
})

export const MetabuilderNavMenu = createJsonComponentWithHooks<MenuProps>(menuDef, {
  hooks: {
    menuState: {
      hookName: 'useMenuState',
      args: () => []
    }
  }
})

export const MetabuilderFormFileUpload = createJsonComponentWithHooks<FileUploadProps>(fileUploadDef, {
  hooks: {
    uploadState: {
      hookName: 'useFileUpload',
      args: (props) => [props.onFilesSelected, props.maxSize, props.disabled]
    }
  }
})

export const MetabuilderWidgetAccordion = createJsonComponentWithHooks<AccordionProps>(accordionDef, {
  hooks: {
    accordionState: {
      hookName: 'useAccordion',
      args: (props) => [props.type || 'single', props.defaultOpen || []]
    }
  }
})

export const MetabuilderWidgetBindingEditor = createJsonComponentWithHooks<BindingEditorProps>(bindingEditorDef, {
  hooks: {
    editorState: {
      hookName: 'useBindingEditor',
      args: (props) => [props.bindings, props.onChange]
    }
  }
})

export const MetabuilderDisplayIconRenderer = createJsonComponent<IconRendererProps>(iconRendererDef)

export const MetabuilderDisplayDynamicText = createJsonComponentWithHooks<DynamicTextProps>(dynamicTextDef, {
  hooks: {
    formattedValue: {
      hookName: 'useFormatValue',
      args: (props) => [props.value, props.format, props.currency, props.locale]
    }
  }
})

export const MetabuilderWidgetAppLayout = createJsonComponentWithHooks<AppLayoutProps>(appLayoutDef, {
  hooks: {
    hookData: {
      hookName: 'useAppLayout',
      args: (props) => [props]
    }
  }
})

export const MetabuilderWidgetAppRouterLayout = createJsonComponentWithHooks<AppRouterLayoutProps>(appRouterLayoutDef, {
  hooks: {
    hookData: {
      hookName: 'useAppRouterLayout',
      args: (props) => [props]
    }
  }
})

export const MetabuilderWidgetAppMainPanel = createJsonComponent<AppMainPanelProps>(appMainPanelDef)

export const MetabuilderDataDataSourceManager = createJsonComponentWithHooks<DataSourceManagerProps>(dataSourceManagerDef, {
  hooks: {
    managerState: {
      hookName: 'useDataSourceManagerState',
      args: (props) => [props.dataSources || [], props.onChange || (() => {})]
    }
  }
})

export const MetabuilderNavNavigationMenu = createJsonComponentWithHooks<NavigationMenuProps>(navigationMenuDef, {
  hooks: {
    menuState: {
      hookName: 'useNavigationMenu',
      args: (props) => [props.featureToggles, props.errorCount || 0, props.activeTab, props.onTabChange]
    }
  }
})

export const MetabuilderDataTreeListPanel = createJsonComponent<TreeListPanelProps>(treeListPanelDef)

// Phase 9: Reusable feature components
export const MetabuilderWidgetErrorPanelHeader = createJsonComponent<ErrorPanelHeaderProps>(errorPanelHeaderDef)
export const MetabuilderWidgetErrorPanelEmptyState = createJsonComponent<ErrorPanelEmptyStateProps>(errorPanelEmptyStateDef)
export const MetabuilderWidgetPWAUpdateSection = createJsonComponent<PWAUpdateSectionProps>(pwaUpdateSectionDef)
export const MetabuilderWidgetPWACacheSection = createJsonComponent<PWACacheSectionProps>(pwaCacheSectionDef)
export const MetabuilderWidgetConflictResolutionStats = createJsonComponent<ConflictResolutionStatsProps>(conflictResolutionStatsDef)
export const MetabuilderWidgetHowItWorksCard = createJsonComponent<HowItWorksCardProps>(howItWorksCardDef)
export const MetabuilderWidgetSearchResults = createJsonComponent<SearchResultsProps>(searchResultsDef)
export const MetabuilderWidgetSearchEmptyState = createJsonComponent<SearchEmptyStateProps>(searchEmptyStateDef)
export const MetabuilderWidgetComprehensiveDemoHeader = createJsonComponent<ComprehensiveDemoHeaderProps>(comprehensiveDemoHeaderDef)
export const MetabuilderWidgetComprehensiveDemoStatsRow = createJsonComponent<ComprehensiveDemoStatsRowProps>(comprehensiveDemoStatsRowDef)
export const MetabuilderWidgetConfigCard = createJsonComponent<ConfigCardProps>(configCardDef)
export const MetabuilderWidgetStatusCard = createJsonComponent<StatusCardProps>(statusCardDef)
export const MetabuilderWidgetInfoSection = createJsonComponent<InfoSectionProps>(infoSectionDef)
export const MetabuilderWidgetListHeader = createJsonComponent<ListHeaderProps>(listHeaderDef)

// Additional deleted components now available as JSON-based exports
export const MetabuilderWidgetColorSwatch = createJsonComponent<ColorSwatchProps>(colorSwatchDef)
export const MetabuilderWidgetComponentTreeNode = createJsonComponent<ComponentTreeNodeProps>(componentTreeNodeDef)
export const MetabuilderLayoutContainer = createJsonComponent<ContainerProps>(containerDef)
export const MetabuilderFeedbackCountBadge = createJsonComponent<CountBadgeProps>(countBadgeDef)
export const MetabuilderDataDataList = createJsonComponent<DataListProps>(dataListDef)
export const MetabuilderWidgetDot = createJsonComponent<DotProps>(dotDef)
export const MetabuilderFeedbackEmptyState = createJsonComponent<EmptyStateProps>(emptyStateDef)
export const MetabuilderFeedbackEmptyStateIcon = createJsonComponent<EmptyStateIconProps>(emptyStateIconDef)
export const MetabuilderLayoutFlex = createJsonComponent<FlexProps>(flexDef)
export const MetabuilderLayoutFlexLayout = createJsonComponent<FlexLayoutProps>(flexLayoutDef)
export const MetabuilderLayoutGridLayout = createJsonComponent<GridLayoutProps>(gridLayoutDef)
export const MetabuilderLayoutGrid = createJsonComponent<GridProps>(gridDef)
export const MetabuilderFormIconButton = createJsonComponent<IconButtonProps>(iconButtonDef)
export const MetabuilderDisplayIconText = createJsonComponent<IconTextProps>(iconTextDef)
export const MetabuilderDisplayIconWrapper = createJsonComponent<IconWrapperProps>(iconWrapperDef)
export const MetabuilderWidgetInfoPanel = createJsonComponent<InfoPanelProps>(infoPanelDef)
export const MetabuilderWidgetKbd = createJsonComponent<KbdProps>(kbdDef)
export const MetabuilderNavLink = createJsonComponent<LinkProps>(linkDef)
export const MetabuilderDataMetricCard = createJsonComponent<MetricCardProps>(metricCardDef)
export const MetabuilderWidgetPanelHeader = createJsonComponent<PanelHeaderProps>(panelHeaderDef)
export const MetabuilderWidgetPropertyEditorField = createJsonComponent<PropertyEditorFieldProps>(propertyEditorFieldDef)
export const MetabuilderLayoutResponsiveGrid = createJsonComponent<ResponsiveGridProps>(responsiveGridDef)
export const MetabuilderLayoutSection = createJsonComponent<SectionProps>(sectionDef)
export const MetabuilderWidgetSpacer = createJsonComponent<SpacerProps>(spacerDef)
export const MetabuilderLayoutStack = createJsonComponent<StackProps>(stackDef)
export const MetabuilderDataStatCard = createJsonComponent<StatCardProps>(statCardDef)
export const MetabuilderFeedbackStatusBadge = createJsonComponent<StatusBadgeProps>(statusBadgeDef)
export const MetabuilderDisplayText = createJsonComponent<TextProps>(textDef)
export const MetabuilderDisplayTreeIcon = createJsonComponent<TreeIconProps>(treeIconDef)


// Phase 12: Page-level components and layouts
export const MetabuilderWidgetSchemaEditorPage = createJsonComponent<SchemaEditorPageProps>(schemaEditorPageDef)
export const MetabuilderWidgetKeyboardShortcutsDialog = createJsonComponent<KeyboardShortcutsDialogProps>(keyboardShortcutsDialogDef)
export const MetabuilderWidgetPreloadIndicator = createJsonComponent<PreloadIndicatorProps>(preloadIndicatorDef)
export const MetabuilderWidgetPWAStatusBar = createJsonComponent<PWAStatusBarProps>(pwaStatusBarDef)
export const MetabuilderWidgetPWAUpdatePrompt = createJsonComponent<PWAUpdatePromptProps>(pwaUpdatePromptDef)
export const MetabuilderWidgetPWAInstallPrompt = createJsonComponent<PWAInstallPromptProps>(pwaInstallPromptDef)
export const MetabuilderWidgetConflictCard = createJsonComponentWithHooks<ConflictCardProps>(
  conflictCardDef,
  {
    hooks: {
      cardState: {
        hookName: 'useConflictCard',
        args: (props) => [props.conflict]
      }
    }
  }
)
export const ConflictDetailsDialog = createJsonComponentWithHooks<ConflictDetailsDialogProps>(
  conflictDetailsDialogDef,
  {
    hooks: {
      dialogState: {
        hookName: 'useConflictDetailsDialog',
        args: (props) => [props.conflict]
      }
    }
  }
)
export const MetabuilderWidgetConflictIndicator = createJsonComponentWithHooks<ConflictIndicatorProps>(
  conflictIndicatorDef,
  {
    hooks: {
      hasConflicts: {
        hookName: 'useConflictResolution',
        args: () => [],
        selector: (result) => result.hasConflicts
      },
      stats: {
        hookName: 'useConflictResolution',
        args: () => [],
        selector: (result) => result.stats
      }
    }
  }
)
export const ConflictResolutionDemo = createJsonComponentWithHooks<ConflictResolutionDemoProps>(
  conflictResolutionDemoDef,
  {
    hooks: {
      demoState: {
        hookName: 'useConflictResolutionDemo',
        args: () => []
      }
    }
  }
)
export const MetabuilderWidgetConflictResolutionPage = createJsonComponentWithHooks<ConflictResolutionPageProps>(
  conflictResolutionPageDef,
  {
    hooks: {
      pageState: {
        hookName: 'useConflictResolutionPage',
        args: (props) => [props.copy || {}]
      }
    }
  }
)
export const MetabuilderWidgetErrorPanel = createJsonComponentWithHooks<ErrorPanelProps>(errorPanelDef, {
  hooks: {
    panelState: {
      hookName: 'useErrorPanelMain',
      args: (props) => [{ files: props.files, onFileChange: props.onFileChange, onFileSelect: props.onFileSelect }],
      spread: true,
    }
  }
})
export const MetabuilderWidgetPreviewDialog = createJsonComponent<PreviewDialogProps>(previewDialogDef)
export const MetabuilderWidgetNotFoundPage = createJsonComponent<NotFoundPageProps>(notFoundPageDef)
export const MetabuilderWidgetGlobalSearch = createJsonComponent<GlobalSearchProps>(globalSearchDef)
export const MetabuilderWidgetFileExplorer = createJsonComponent<FileExplorerProps>(fileExplorerDef)
export const MetabuilderWidgetJSONFlaskDesigner = createJsonComponent<JSONFlaskDesignerProps>(jsonFlaskDesignerDef)
export const MetabuilderWidgetJSONStyleDesigner = createJsonComponent<JSONStyleDesignerProps>(jsonStyleDesignerDef)
export const MetabuilderWidgetComponentTreeDemoPage = createJsonComponent<ComponentTreeDemoPageProps>(componentTreeDemoPageDef)
export const MetabuilderWidgetJSONConversionShowcase = createJsonComponent<JSONConversionShowcaseProps>(jsonConversionShowcaseDef)
export const MetabuilderWidgetJSONLambdaDesigner = createJsonComponent<JSONLambdaDesignerProps>(jsonLambdaDesignerDef)
export const MetabuilderWidgetJSONModelDesigner = createJsonComponent<JSONModelDesignerProps>(jsonModelDesignerDef)
export const MetabuilderWidgetJSONWorkflowDesigner = createJsonComponent<JSONWorkflowDesignerProps>(jsonWorkflowDesignerDef)
export const MetabuilderWidgetJSONComponentTreeManager = createJsonComponent<JSONComponentTreeManagerProps>(jsonComponentTreeManagerDef)
export const MetabuilderWidgetSassStylesShowcase = createJsonComponent<SassStylesShowcaseProps>(sassStylesShowcaseDef)
export const MetabuilderWidgetAtomicComponentShowcase = createJsonComponent<AtomicComponentShowcaseProps>(atomicComponentShowcaseDef)
export const MetabuilderWidgetJSONUIShowcasePage = createJsonComponent<JSONUIShowcasePageProps>(jsonUiShowcasePageDef)
export const MetabuilderWidgetJSONDemoPage = createJsonComponent<JSONDemoPageProps>(jsonDemoPageDef)
export const MetabuilderWidgetDashboardDemoPage = createJsonComponent<DashboardDemoPageProps>(dashboardDemoPageDef)
export const MetabuilderWidgetComprehensiveDemoPage = createJsonComponent<ComprehensiveDemoPageProps>(comprehensiveDemoPageDef)
export const MetabuilderWidgetTemplateExplorer = createJsonComponent<TemplateExplorerProps>(templateExplorerDef)
export const MetabuilderWidgetProjectManager = createJsonComponentWithHooks<ProjectManagerProps>(projectManagerDef, {
  hooks: {
    hookData: {
      hookName: 'useProjectManagerDropdown',
      args: () => []
    }
  }
})

export const MetabuilderWidgetDBALSearchInput = createJsonComponentWithHooks<DBALSearchInputProps>(dbalSearchInputDef, {
  hooks: {
    hookData: {
      hookName: 'useDBALSearchInput',
      args: (props) => [{ onNavigate: props.onNavigate || (() => {}) }]
    }
  }
})

export const MetabuilderWidgetHeaderSearch = createJsonComponentWithHooks<HeaderSearchProps>(headerSearchDef, {
  hooks: {
    hookData: {
      hookName: 'useSearchInput',
      args: (props) => [{ onNavigate: props.onNavigate || (() => {}) }]
    }
  }
})

export const MetabuilderWidgetQuickSeedButton = createJsonComponentWithHooks<QuickSeedButtonProps>(quickSeedButtonDef, {
  hooks: {
    hookData: {
      hookName: 'useQuickSeed',
      args: () => []
    }
  }
})
export const MetabuilderWidgetTranslationEditor = createJsonComponentWithHooks<TranslationEditorProps>(translationEditorDef, {
  hooks: {
    hookData: {
      hookName: 'useTranslationEditor',
      args: () => []
    }
  }
})

export const MetabuilderWidgetStorageSettingsPanel = createJsonComponent<StorageSettingsPanelProps>(storageSettingsPanelDef)
export const MetabuilderWidgetFeatureToggleSettings = createJsonComponentWithHooks<FeatureToggleSettingsProps>(featureToggleSettingsDef, {
  hooks: {
    toggleState: {
      hookName: 'useFeatureToggleSettings',
      args: (props) => [props.features, props.onFeaturesChange],
      spread: true,
    }
  }
})

export const MetabuilderWidgetDocumentationView = createJsonComponentWithHooks<DocumentationViewProps>(documentationViewDef, {
  hooks: {
    viewState: {
      hookName: 'useDocumentationView',
      args: () => [],
      spread: true,
    }
  }
})

export const MetabuilderWidgetDockerBuildDebugger = createJsonComponentWithHooks<DockerBuildDebuggerProps>(dockerBuildDebuggerDef, {
  hooks: {
    debuggerState: {
      hookName: 'useDockerBuildDebugger',
      args: () => []
    }
  }
})

export const MetabuilderWidgetDataBindingDesigner = createJsonComponentWithHooks<DataBindingDesignerProps>(dataBindingDesignerDef, {
  hooks: {
    designerState: {
      hookName: 'useDataBindingDesigner',
      args: () => []
    }
  }
})

export const MetabuilderWidgetErrorPanelMain = createJsonComponentWithHooks<ErrorPanelMainProps>(errorPanelMainDef, {
  hooks: {
    panelState: {
      hookName: 'useErrorPanelMain',
      args: (props) => [props.files, props.onFileChange, props.onFileSelect]
    }
  }
})

export const MetabuilderWidgetFaviconDesigner = createJsonComponentWithHooks<FaviconDesignerProps>(faviconDesignerDef, {
  hooks: {
    designerState: {
      hookName: 'useFaviconDesigner',
      args: () => []
    }
  }
})

export const MetabuilderWidgetFeatureIdeaCloud = createJsonComponentWithHooks<FeatureIdeaCloudProps>(featureIdeaCloudDef, {
  hooks: {
    cloudState: {
      hookName: 'useFeatureIdeaCloud',
      args: () => []
    }
  }
})

export const MetabuilderDataLazyBarChart = createJsonComponent<LazyBarChartProps>(lazyBarChartDef)
export const MetabuilderDataLazyLineChart = createJsonComponent<LazyLineChartProps>(lazyLineChartDef)
export const MetabuilderNavNavigationGroupHeader = createJsonComponent<NavigationGroupHeaderProps>(navigationGroupHeaderDef)

export const MetabuilderWidgetPersistenceDashboard = createJsonComponentWithHooks<PersistenceDashboardProps>(
  persistenceDashboardDef,
  {
    hooks: {
      viewData: {
        hookName: 'usePersistenceDashboardView',
        args: () => []
      }
    }
  }
)

// Converted TSX page-level components
export const MetabuilderWidgetCodeEditor = createJsonComponentWithHooks<CodeEditorProps>(
  codeEditorDef,
  {
    hooks: {
      editorState: {
        hookName: 'useCodeEditor',
        args: (props) => [{ files: props.files, activeFileId: props.activeFileId, onFileChange: props.onFileChange, onFileSelect: props.onFileSelect, onFileClose: props.onFileClose }]
      }
    }
  }
)

export const MetabuilderWidgetPlaywrightDesigner = createJsonComponentWithHooks<PlaywrightDesignerProps>(
  playwrightDesignerDef,
  {
    hooks: {
      designerState: {
        hookName: 'usePlaywrightDesigner',
        args: (props) => [props.tests, props.onTestsChange],
        spread: true
      }
    }
  }
)

export const MetabuilderWidgetUnitTestDesigner = createJsonComponentWithHooks<UnitTestDesignerProps>(
  unitTestDesignerDef,
  {
    hooks: {
      designerState: {
        hookName: 'useUnitTestDesigner',
        args: (props) => [{ tests: props.tests, onTestsChange: props.onTestsChange }]
      }
    }
  }
)

export const MetabuilderWidgetStorybookDesigner = createJsonComponentWithHooks<StorybookDesignerProps>(
  storybookDesignerDef,
  {
    hooks: {
      designerState: {
        hookName: 'useStorybookDesigner',
        args: (props) => [{ stories: props.stories, onStoriesChange: props.onStoriesChange }]
      }
    }
  }
)

export const MetabuilderWidgetPWASettings = createJsonComponentWithHooks<PWASettingsProps>(
  pwaSettingsDef,
  {
    hooks: {
      pwaState: {
        hookName: 'usePWASettings',
        args: () => []
      }
    }
  }
)

export const MetabuilderWidgetTemplateSelector = createJsonComponentWithHooks<TemplateSelectorProps>(
  templateSelectorDef,
  {
    hooks: {
      hookData: {
        hookName: 'useTemplateSelector',
        args: () => []
      }
    }
  }
)

export const MetabuilderWidgetPersistenceExample = createJsonComponentWithHooks<PersistenceExampleProps>(
  persistenceExampleDef,
  {
    hooks: {
      exampleState: {
        hookName: 'usePersistenceExample',
        args: () => []
      }
    }
  }
)

export const MetabuilderWidgetProjectSettingsDesigner = createJsonComponentWithHooks<ProjectSettingsDesignerProps>(
  projectSettingsDesignerDef,
  {
    hooks: {
      settingsState: {
        hookName: 'useProjectSettingsView',
        args: (props) => [{ nextjsConfig: props.nextjsConfig, npmSettings: props.npmSettings, onNextjsConfigChange: props.onNextjsConfigChange, onNpmSettingsChange: props.onNpmSettingsChange }],
        spread: true
      }
    }
  }
)

export const MetabuilderWidgetAtomicLibraryShowcase = createJsonComponentWithHooks<AtomicLibraryShowcaseProps>(
  atomicLibraryShowcaseDef,
  {
    hooks: {
      showcaseState: {
        hookName: 'useAtomicLibraryShowcase',
        args: () => []
      }
    }
  }
)

