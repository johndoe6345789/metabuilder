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
  ShadcnButtonProps,
  ShadcnCardProps,
  ShadcnCardHeaderProps,
  ShadcnCardTitleProps,
  ShadcnCardContentProps,
  ShadcnBadgeProps,
  ShadcnLabelProps,
  ShadcnInputProps,
  ShadcnTextareaProps,
  ShadcnSeparatorProps,
  ShadcnScrollAreaProps,
  ShadcnTabsProps,
  ShadcnTabsListProps,
  ShadcnTabsTriggerProps,
  ShadcnTabsContentProps,
  ShadcnDialogProps,
  ShadcnDialogContentProps,
  ShadcnDialogHeaderProps,
  ShadcnDialogTitleProps,
  ShadcnSelectProps,
  ShadcnSelectTriggerProps,
  ShadcnSelectContentProps,
  ShadcnSelectItemProps,
  ShadcnSliderProps,
  ShadcnSwitchProps,
  ShadcnCheckboxProps,
  ShadcnTooltipProps,
  ShadcnTooltipTriggerProps,
  ShadcnTooltipContentProps,
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
  StorageSettingsPanelProps,
  FeatureToggleSettingsProps,
  DocumentationViewProps,
  DockerBuildDebuggerProps,
  DataBindingDesignerProps,
  ErrorPanelMainProps,
  FaviconDesignerProps,
  FeatureIdeaCloudProps,
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

// Shadcn/ui component definitions
import shadcnButtonDef from '@/components/json-definitions/shadcn-button.json'
import shadcnBadgeDef from '@/components/json-definitions/shadcn-badge.json'
import shadcnCardDef from '@/components/json-definitions/shadcn-card.json'
import shadcnCardHeaderDef from '@/components/json-definitions/shadcn-card-header.json'
import shadcnCardTitleDef from '@/components/json-definitions/shadcn-card-title.json'
import shadcnCardContentDef from '@/components/json-definitions/shadcn-card-content.json'
import shadcnLabelDef from '@/components/json-definitions/shadcn-label.json'
import shadcnInputDef from '@/components/json-definitions/shadcn-input.json'
import shadcnTextareaDef from '@/components/json-definitions/shadcn-textarea.json'
import shadcnSeparatorDef from '@/components/json-definitions/shadcn-separator.json'
import shadcnScrollAreaDef from '@/components/json-definitions/shadcn-scroll-area.json'
import shadcnTabsDef from '@/components/json-definitions/shadcn-tabs.json'
import shadcnTabsListDef from '@/components/json-definitions/shadcn-tabs-list.json'
import shadcnTabsTriggerDef from '@/components/json-definitions/shadcn-tabs-trigger.json'
import shadcnTabsContentDef from '@/components/json-definitions/shadcn-tabs-content.json'
import shadcnDialogDef from '@/components/json-definitions/shadcn-dialog.json'
import shadcnDialogContentDef from '@/components/json-definitions/shadcn-dialog-content.json'
import shadcnDialogHeaderDef from '@/components/json-definitions/shadcn-dialog-header.json'
import shadcnDialogTitleDef from '@/components/json-definitions/shadcn-dialog-title.json'
import shadcnSelectDef from '@/components/json-definitions/shadcn-select.json'
import shadcnSelectTriggerDef from '@/components/json-definitions/shadcn-select-trigger.json'
import shadcnSelectContentDef from '@/components/json-definitions/shadcn-select-content.json'
import shadcnSelectItemDef from '@/components/json-definitions/shadcn-select-item.json'
import shadcnSliderDef from '@/components/json-definitions/shadcn-slider.json'
import shadcnSwitchDef from '@/components/json-definitions/shadcn-switch.json'
import shadcnCheckboxDef from '@/components/json-definitions/shadcn-checkbox.json'
import shadcnTooltipDef from '@/components/json-definitions/shadcn-tooltip.json'
import shadcnTooltipTriggerDef from '@/components/json-definitions/shadcn-tooltip-trigger.json'
import shadcnTooltipContentDef from '@/components/json-definitions/shadcn-tooltip-content.json'
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
import storageSettingsPanelDef from '@/components/json-definitions/storage-settings-panel.json'
import featureToggleSettingsDef from '@/components/json-definitions/feature-toggle-settings.json'
import documentationViewDef from '@/components/json-definitions/documentation-view.json'
import dockerBuildDebuggerDef from '@/components/json-definitions/docker-build-debugger.json'
import dataBindingDesignerDef from '@/components/json-definitions/data-binding-designer.json'
import errorPanelMainDef from '@/components/json-definitions/error-panel-main.json'
import faviconDesignerDef from '@/components/json-definitions/favicon-designer.json'
import featureIdeaCloudDef from '@/components/json-definitions/feature-idea-cloud.json'

// Create pure JSON components (no hooks)
export const BindingIndicator = createJsonComponent<BindingIndicatorProps>(bindingIndicatorDef)
export const ButtonGroup = createJsonComponent<ButtonGroupProps>(buttonGroupDef)
export const Chip = createJsonComponent<ChipProps>(chipDef)
export const CircularProgress = createJsonComponent<CircularProgressProps>(circularProgressDef)
export const Code = createJsonComponent<CodeProps>(codeDef)
export const ConditionalWrapper = createJsonComponent<ConditionalWrapperProps>(conditionalWrapperDef)
export const CommandPalette = createJsonComponent<CommandPaletteProps>(commandPaletteDef)
export const CompletionCard = createJsonComponent<CompletionCardProps>(completionCardDef)
export const ComponentPaletteItem = createJsonComponent<ComponentPaletteItemProps>(componentPaletteItemDef)
export const ConfirmButton = createJsonComponent<ConfirmButtonProps>(confirmButtonDef)
export const DataSourceBadge = createJsonComponent<DataSourceBadgeProps>(dataSourceBadgeDef)
export const DataTable = createJsonComponent<DataTableProps<any>>(dataTableDef)
export const LoadingFallback = createJsonComponent<LoadingFallbackProps>(loadingFallbackDef)
export const NavigationItem = createJsonComponent<NavigationItemProps>(navigationItemDef)
export const PageHeaderContent = createJsonComponent<PageHeaderContentProps>(pageHeaderContentDef)
export const PageHeader = createJsonComponent<PageHeaderProps>(pageHeaderDef)
export const ComponentBindingDialog = createJsonComponent<ComponentBindingDialogProps>(componentBindingDialogDef)
export const DataSourceEditorDialog = createJsonComponent<DataSourceEditorDialogProps>(dataSourceEditorDialogDef)
export const GitHubBuildStatus = createJsonComponent<GitHubBuildStatusProps>(githubBuildStatusDef)
export const SeedDataManager = createJsonComponent<SeedDataManagerProps>(seedDataManagerDef)
export const TreeCard = createJsonComponent<TreeCardProps>(treeCardDef)
export const AppDialogs = createJsonComponent<AppDialogsProps>(appDialogsDef)
export const ActionButton = createJsonComponent<ActionButtonProps>(actionButtonDef)
export const ActionCard = createJsonComponent<ActionCardProps>(actionCardDef)
export const ActionIcon = createJsonComponent<ActionIconProps>(actionIconDef)
export const Alert = createJsonComponent<AlertProps>(alertDef)
export const AppLogo = createJsonComponent<AppLogoProps>(appLogoDef)
export const Avatar = createJsonComponent<AvatarProps>(avatarDef)
export const AvatarGroup = createJsonComponent<AvatarGroupProps>(avatarGroupDef)
export const Badge = createJsonComponent<BadgeProps>(badgeDef)
export const Breadcrumb = createJsonComponent<BreadcrumbProps>(breadcrumbDef)
export const Button = createJsonComponent<ButtonProps>(buttonDef)
export const Calendar = createJsonComponent<CalendarProps>(calendarDef)
export const Card = createJsonComponent<CardProps>(cardDef)
export const Checkbox = createJsonComponent<CheckboxProps>(checkboxDef)
export const ContextMenu = createJsonComponent<ContextMenuProps>(contextMenuDef)
export const DatePicker = createJsonComponent<DatePickerProps>(datePickerDef)
export const DetailRow = createJsonComponent<DetailRowProps>(detailRowDef)
export const Dialog = createJsonComponent<DialogProps>(dialogDef)
export const Drawer = createJsonComponent<DrawerProps>(drawerDef)
export const Divider = createJsonComponent<DividerProps>(dividerDef)
export const DropdownMenu = createJsonComponent<DropdownMenuProps>(dropdownMenuDef)
export const EmptyMessage = createJsonComponent<EmptyMessageProps>(emptyMessageDef)
export const ErrorBadge = createJsonComponent<ErrorBadgeProps>(errorBadgeDef)
export const FileIcon = createJsonComponent<FileIconProps>(fileIconDef)
export const Form = createJsonComponent<FormProps>(formDef)
export const FormField = createJsonComponent<FormFieldProps>(formFieldDef)
export const GlowCard = createJsonComponent<GlowCardProps>(glowCardDef)
export const Heading = createJsonComponent<HeadingProps>(headingDef)
export const HelperText = createJsonComponent<HelperTextProps>(helperTextDef)
export const HoverCard = createJsonComponent<HoverCardProps>(hoverCardDef)
export const Icon = createJsonComponent<IconProps>(iconDef)
export const InputOTP = createJsonComponent<InputOTPProps>(inputOtpDef)
export const Label = createJsonComponent<LabelProps>(labelDef)
export const Pagination = createJsonComponent<PaginationProps>(paginationDef)
export const Panel = createJsonComponent<PanelProps>(panelDef)
export const Progress = createJsonComponent<ProgressProps>(progressDef)
export const ProgressBar = createJsonComponent<ProgressBarProps>(progressBarDef)
export const Pulse = createJsonComponent<PulseProps>(pulseDef)
export const QuickActionButton = createJsonComponent<QuickActionButtonProps>(quickActionButtonDef)
export const RadioGroup = createJsonComponent<RadioGroupProps>(radioGroupDef)
export const Sparkle = createJsonComponent<SparkleProps>(sparkleDef)
export const RangeSlider = createJsonComponent<RangeSliderProps>(rangeSliderDef)
export const Rating = createJsonComponent<RatingProps>(ratingDef)
export const ScrollArea = createJsonComponent<ScrollAreaProps>(scrollAreaDef)
export const ScrollAreaThumb = createJsonComponent<ScrollAreaThumbProps>(scrollAreaThumbDef)
export const SearchInput = createJsonComponent<SearchInputProps>(searchInputDef)
export const SeedDataStatus = createJsonComponent<SeedDataStatusProps>(seedDataStatusDef)
export const Select = createJsonComponent<SelectProps>(selectDef)
export const Separator = createJsonComponent<SeparatorProps>(separatorDef)
export const Skeleton = createJsonComponent<SkeletonProps>(skeletonDef)
export const Slider = createJsonComponent<SliderProps>(sliderDef)
export const Spinner = createJsonComponent<SpinnerProps>(spinnerDef)
export const StatusIcon = createJsonComponent<StatusIconProps>(statusIconDef)
export const StepIndicator = createJsonComponent<StepIndicatorProps>(stepIndicatorDef)
export const Stepper = createJsonComponent<StepperProps>(stepperDef)
export const Switch = createJsonComponent<SwitchProps>(switchDef)
export const Table = createJsonComponent<TableProps>(tableDef)
export const Tabs = createJsonComponent<TabsProps>(tabsDef)
export const Tag = createJsonComponent<TagProps>(tagDef)
export const TextArea = createJsonComponent<TextAreaProps>(textareaDef)
export const TextGradient = createJsonComponent<TextGradientProps>(textGradientDef)
export const TextHighlight = createJsonComponent<TextHighlightProps>(textHighlightDef)
export const Timeline = createJsonComponent<TimelineProps>(timelineDef)
export const Timestamp = createJsonComponent<TimestampProps>(timestampDef)
export const Toggle = createJsonComponent<ToggleProps>(toggleDef)
export const Tooltip = createJsonComponent<TooltipProps>(tooltipDef)
export const TabIcon = createJsonComponent<TabIconProps>(tabIconDef)
export const TipsCard = createJsonComponent<TipsCardProps>(tipsCardDef)
export const InfoBox = createJsonComponent<InfoBoxProps>(infoBoxDef)
export const KeyValue = createJsonComponent<KeyValueProps>(keyValueDef)
export const LiveIndicator = createJsonComponent<LiveIndicatorProps>(liveIndicatorDef)
export const List = createJsonComponent<ListProps<any>>(listDef)
export const ListItem = createJsonComponent<ListItemProps>(listItemDef)
export const LoadingSpinner = createJsonComponent<LoadingSpinnerProps>(loadingSpinnerDef)
export const LoadingState = createJsonComponent<LoadingStateProps>(loadingStateDef)
export const MetricDisplay = createJsonComponent<MetricDisplayProps>(metricDisplayDef)
export const Modal = createJsonComponent<ModalProps>(modalDef)
export const Notification = createJsonComponent<NotificationProps>(notificationDef)
export const NumberInput = createJsonComponent<NumberInputProps>(numberInputDef)
export const AppBranding = createJsonComponent<AppBrandingProps>(appBrandingDef)
export const DataSourceCard = createJsonComponent<DataSourceCardProps>(dataSourceCardDef)
export const CodeExplanationDialog = createJsonComponent<CodeExplanationDialogProps>(codeExplanationDialogDef)
export const ComponentPalette = createJsonComponent<ComponentPaletteProps>(componentPaletteDef)
export const CanvasRenderer = createJsonComponent<CanvasRendererProps>(canvasRendererDef)
export const EmptyCanvasState = createJsonComponent<EmptyCanvasStateProps>(emptyCanvasStateDef)
export const SchemaCodeViewer = createJsonComponent<SchemaCodeViewerProps>(schemaCodeViewerDef)
export const ToolbarActions = createJsonComponent<ToolbarActionsProps>(toolbarActionsDef)
export const AppHeader = createJsonComponent<AppHeaderProps>(appHeaderDef)
export const SchemaEditorCanvas = createJsonComponent<SchemaEditorCanvasProps>(schemaEditorCanvasDef)
export const SchemaEditorLayout = createJsonComponent<SchemaEditorLayoutProps>(schemaEditorLayoutDef)
export const SchemaEditorPropertiesPanel = createJsonComponent<SchemaEditorPropertiesPanelProps>(schemaEditorPropertiesPanelDef)
export const SchemaEditorSidebar = createJsonComponent<SchemaEditorSidebarProps>(schemaEditorSidebarDef)
export const SchemaEditorStatusBar = createJsonComponent<SchemaEditorStatusBarProps>(schemaEditorStatusBarDef)
export const SchemaEditorToolbar = createJsonComponent<SchemaEditorToolbarProps>(schemaEditorToolbarDef)

// Create JSON components with hooks
export const SaveIndicator = createJsonComponentWithHooks<SaveIndicatorProps>(saveIndicatorDef, {
  hooks: {
    hookData: {
      hookName: 'useSaveIndicator',
      args: (props) => [props.lastSaved ?? null]
    }
  }
})

export const ComponentTree = createJsonComponentWithHooks<ComponentTreeProps>(componentTreeDef, {
  hooks: {
    treeData: {
      hookName: 'useComponentTree',
      args: (props) => [props.components || [], props.selectedId || null]
    }
  }
})

export const LazyD3BarChart = createJsonComponentWithHooks<LazyD3BarChartProps>(lazyD3BarChartDef, {
  hooks: {
    chartData: {
      hookName: 'useD3BarChart',
      args: (props) => [props.data, props.width, props.height]
    }
  }
})

export const StorageSettings = createJsonComponentWithHooks<StorageSettingsProps>(storageSettingsDef, {
  hooks: {
    backendInfo: {
      hookName: 'useStorageBackendInfo',
      args: (props) => [props.backend || null]
    }
  }
})

export const FilterInput = createJsonComponentWithHooks<FilterInputProps>(filterInputDef, {
  hooks: {
    focusState: {
      hookName: 'useFocusState',
      args: () => []
    }
  }
})

export const CopyButton = createJsonComponentWithHooks<CopyButtonProps>(copyButtonDef, {
  hooks: {
    copyState: {
      hookName: 'useCopyState',
      args: (props) => [props.text]
    }
  }
})

export const Input = createJsonComponent<InputProps>(inputDef)

export const PasswordInput = createJsonComponentWithHooks<PasswordInputProps>(passwordInputDef, {
  hooks: {
    visibility: {
      hookName: 'usePasswordVisibility',
      args: () => []
    }
  }
})

export const Image = createJsonComponentWithHooks<ImageProps>(imageDef, {
  hooks: {
    imageState: {
      hookName: 'useImageState',
      args: (props) => [props.onLoad, props.onError]
    }
  }
})
export const DataCard = createJsonComponent<DataCardProps>(dataCardDef)

export const RepeatWrapper = createJsonComponentWithHooks<RepeatWrapperProps>(repeatWrapperDef, {
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

export const Popover = createJsonComponentWithHooks<PopoverProps>(popoverDef, {
  hooks: {
    state: {
      hookName: 'usePopoverState',
      args: () => []
    }
  }
})

export const Menu = createJsonComponentWithHooks<MenuProps>(menuDef, {
  hooks: {
    menuState: {
      hookName: 'useMenuState',
      args: () => []
    }
  }
})

export const FileUpload = createJsonComponentWithHooks<FileUploadProps>(fileUploadDef, {
  hooks: {
    uploadState: {
      hookName: 'useFileUpload',
      args: (props) => [props.onFilesSelected, props.maxSize, props.disabled]
    }
  }
})

export const Accordion = createJsonComponentWithHooks<AccordionProps>(accordionDef, {
  hooks: {
    accordionState: {
      hookName: 'useAccordion',
      args: (props) => [props.type || 'single', props.defaultOpen || []]
    }
  }
})

export const BindingEditor = createJsonComponentWithHooks<BindingEditorProps>(bindingEditorDef, {
  hooks: {
    editorState: {
      hookName: 'useBindingEditor',
      args: (props) => [props.bindings, props.onChange]
    }
  }
})

export const IconRenderer = createJsonComponent<IconRendererProps>(iconRendererDef)

export const DynamicText = createJsonComponentWithHooks<DynamicTextProps>(dynamicTextDef, {
  hooks: {
    formattedValue: {
      hookName: 'useFormatValue',
      args: (props) => [props.value, props.format, props.currency, props.locale]
    }
  }
})

export const AppLayout = createJsonComponentWithHooks<AppLayoutProps>(appLayoutDef, {
  hooks: {
    hookData: {
      hookName: 'useAppLayout',
      args: (props) => [props]
    }
  }
})

export const AppRouterLayout = createJsonComponentWithHooks<AppRouterLayoutProps>(appRouterLayoutDef, {
  hooks: {
    hookData: {
      hookName: 'useAppRouterLayout',
      args: (props) => [props]
    }
  }
})

export const AppMainPanel = createJsonComponent<AppMainPanelProps>(appMainPanelDef)

export const DataSourceManager = createJsonComponentWithHooks<DataSourceManagerProps>(dataSourceManagerDef, {
  hooks: {
    managerState: {
      hookName: 'useDataSourceManagerState',
      args: (props) => [props.dataSources || [], props.onChange || (() => {})]
    }
  }
})

export const NavigationMenu = createJsonComponentWithHooks<NavigationMenuProps>(navigationMenuDef, {
  hooks: {
    menuState: {
      hookName: 'useNavigationMenu',
      args: (props) => [props.featureToggles, props.errorCount || 0]
    }
  }
})

export const TreeListPanel = createJsonComponent<TreeListPanelProps>(treeListPanelDef)

// Phase 9: Reusable feature components
export const ErrorPanelHeader = createJsonComponent<ErrorPanelHeaderProps>(errorPanelHeaderDef)
export const ErrorPanelEmptyState = createJsonComponent<ErrorPanelEmptyStateProps>(errorPanelEmptyStateDef)
export const PWAUpdateSection = createJsonComponent<PWAUpdateSectionProps>(pwaUpdateSectionDef)
export const PWACacheSection = createJsonComponent<PWACacheSectionProps>(pwaCacheSectionDef)
export const ConflictResolutionStats = createJsonComponent<ConflictResolutionStatsProps>(conflictResolutionStatsDef)
export const HowItWorksCard = createJsonComponent<HowItWorksCardProps>(howItWorksCardDef)
export const SearchResults = createJsonComponent<SearchResultsProps>(searchResultsDef)
export const SearchEmptyState = createJsonComponent<SearchEmptyStateProps>(searchEmptyStateDef)
export const ComprehensiveDemoHeader = createJsonComponent<ComprehensiveDemoHeaderProps>(comprehensiveDemoHeaderDef)
export const ComprehensiveDemoStatsRow = createJsonComponent<ComprehensiveDemoStatsRowProps>(comprehensiveDemoStatsRowDef)
export const ConfigCard = createJsonComponent<ConfigCardProps>(configCardDef)
export const StatusCard = createJsonComponent<StatusCardProps>(statusCardDef)
export const InfoSection = createJsonComponent<InfoSectionProps>(infoSectionDef)
export const ListHeader = createJsonComponent<ListHeaderProps>(listHeaderDef)

// Additional deleted components now available as JSON-based exports
export const ColorSwatch = createJsonComponent<ColorSwatchProps>(colorSwatchDef)
export const ComponentTreeNode = createJsonComponent<ComponentTreeNodeProps>(componentTreeNodeDef)
export const Container = createJsonComponent<ContainerProps>(containerDef)
export const CountBadge = createJsonComponent<CountBadgeProps>(countBadgeDef)
export const DataList = createJsonComponent<DataListProps>(dataListDef)
export const Dot = createJsonComponent<DotProps>(dotDef)
export const EmptyState = createJsonComponent<EmptyStateProps>(emptyStateDef)
export const EmptyStateIcon = createJsonComponent<EmptyStateIconProps>(emptyStateIconDef)
export const Flex = createJsonComponent<FlexProps>(flexDef)
export const FlexLayout = createJsonComponent<FlexLayoutProps>(flexLayoutDef)
export const GridLayout = createJsonComponent<GridLayoutProps>(gridLayoutDef)
export const Grid = createJsonComponent<GridProps>(gridDef)
export const IconButton = createJsonComponent<IconButtonProps>(iconButtonDef)
export const IconText = createJsonComponent<IconTextProps>(iconTextDef)
export const IconWrapper = createJsonComponent<IconWrapperProps>(iconWrapperDef)
export const InfoPanel = createJsonComponent<InfoPanelProps>(infoPanelDef)
export const Kbd = createJsonComponent<KbdProps>(kbdDef)
export const Link = createJsonComponent<LinkProps>(linkDef)
export const MetricCard = createJsonComponent<MetricCardProps>(metricCardDef)
export const PanelHeader = createJsonComponent<PanelHeaderProps>(panelHeaderDef)
export const PropertyEditorField = createJsonComponent<PropertyEditorFieldProps>(propertyEditorFieldDef)
export const ResponsiveGrid = createJsonComponent<ResponsiveGridProps>(responsiveGridDef)
export const Section = createJsonComponent<SectionProps>(sectionDef)
export const Spacer = createJsonComponent<SpacerProps>(spacerDef)
export const Stack = createJsonComponent<StackProps>(stackDef)
export const StatCard = createJsonComponent<StatCardProps>(statCardDef)
export const StatusBadge = createJsonComponent<StatusBadgeProps>(statusBadgeDef)
export const Text = createJsonComponent<TextProps>(textDef)
export const TreeIcon = createJsonComponent<TreeIconProps>(treeIconDef)

// Shadcn/ui wrapper components
export const ShadcnButton = createJsonComponent<ShadcnButtonProps>(shadcnButtonDef)
export const ShadcnBadge = createJsonComponent<ShadcnBadgeProps>(shadcnBadgeDef)
export const ShadcnCard = createJsonComponent<ShadcnCardProps>(shadcnCardDef)
export const ShadcnCardHeader = createJsonComponent<ShadcnCardHeaderProps>(shadcnCardHeaderDef)
export const ShadcnCardTitle = createJsonComponent<ShadcnCardTitleProps>(shadcnCardTitleDef)
export const ShadcnCardContent = createJsonComponent<ShadcnCardContentProps>(shadcnCardContentDef)
export const ShadcnLabel = createJsonComponent<ShadcnLabelProps>(shadcnLabelDef)
export const ShadcnInput = createJsonComponent<ShadcnInputProps>(shadcnInputDef)
export const ShadcnTextarea = createJsonComponent<ShadcnTextareaProps>(shadcnTextareaDef)
export const ShadcnSeparator = createJsonComponent<ShadcnSeparatorProps>(shadcnSeparatorDef)
export const ShadcnScrollArea = createJsonComponent<ShadcnScrollAreaProps>(shadcnScrollAreaDef)
export const ShadcnTabs = createJsonComponent<ShadcnTabsProps>(shadcnTabsDef)
export const ShadcnTabsList = createJsonComponent<ShadcnTabsListProps>(shadcnTabsListDef)
export const ShadcnTabsTrigger = createJsonComponent<ShadcnTabsTriggerProps>(shadcnTabsTriggerDef)
export const ShadcnTabsContent = createJsonComponent<ShadcnTabsContentProps>(shadcnTabsContentDef)
export const ShadcnDialog = createJsonComponent<ShadcnDialogProps>(shadcnDialogDef)
export const ShadcnDialogContent = createJsonComponent<ShadcnDialogContentProps>(shadcnDialogContentDef)
export const ShadcnDialogHeader = createJsonComponent<ShadcnDialogHeaderProps>(shadcnDialogHeaderDef)
export const ShadcnDialogTitle = createJsonComponent<ShadcnDialogTitleProps>(shadcnDialogTitleDef)
export const ShadcnSelect = createJsonComponent<ShadcnSelectProps>(shadcnSelectDef)
export const ShadcnSelectTrigger = createJsonComponent<ShadcnSelectTriggerProps>(shadcnSelectTriggerDef)
export const ShadcnSelectContent = createJsonComponent<ShadcnSelectContentProps>(shadcnSelectContentDef)
export const ShadcnSelectItem = createJsonComponent<ShadcnSelectItemProps>(shadcnSelectItemDef)
export const ShadcnSlider = createJsonComponent<ShadcnSliderProps>(shadcnSliderDef)
export const ShadcnSwitch = createJsonComponent<ShadcnSwitchProps>(shadcnSwitchDef)
export const ShadcnCheckbox = createJsonComponent<ShadcnCheckboxProps>(shadcnCheckboxDef)
export const ShadcnTooltip = createJsonComponent<ShadcnTooltipProps>(shadcnTooltipDef)
export const ShadcnTooltipTrigger = createJsonComponent<ShadcnTooltipTriggerProps>(shadcnTooltipTriggerDef)
export const ShadcnTooltipContent = createJsonComponent<ShadcnTooltipContentProps>(shadcnTooltipContentDef)

// Phase 12: Page-level components and layouts
export const SchemaEditorPage = createJsonComponent<SchemaEditorPageProps>(schemaEditorPageDef)
export const KeyboardShortcutsDialog = createJsonComponent<KeyboardShortcutsDialogProps>(keyboardShortcutsDialogDef)
export const PreloadIndicator = createJsonComponent<PreloadIndicatorProps>(preloadIndicatorDef)
export const PWAStatusBar = createJsonComponent<PWAStatusBarProps>(pwaStatusBarDef)
export const PWAUpdatePrompt = createJsonComponent<PWAUpdatePromptProps>(pwaUpdatePromptDef)
export const PWAInstallPrompt = createJsonComponent<PWAInstallPromptProps>(pwaInstallPromptDef)
export const ConflictCard = createJsonComponentWithHooks<ConflictCardProps>(
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
export const ConflictIndicator = createJsonComponentWithHooks<ConflictIndicatorProps>(
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
export const ConflictResolutionPage = createJsonComponentWithHooks<ConflictResolutionPageProps>(
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
export const ErrorPanel = createJsonComponent<ErrorPanelProps>(errorPanelDef)
export const PreviewDialog = createJsonComponent<PreviewDialogProps>(previewDialogDef)
export const NotFoundPage = createJsonComponent<NotFoundPageProps>(notFoundPageDef)
export const GlobalSearch = createJsonComponent<GlobalSearchProps>(globalSearchDef)
export const FileExplorer = createJsonComponent<FileExplorerProps>(fileExplorerDef)
export const JSONFlaskDesigner = createJsonComponent<JSONFlaskDesignerProps>(jsonFlaskDesignerDef)
export const JSONStyleDesigner = createJsonComponent<JSONStyleDesignerProps>(jsonStyleDesignerDef)
export const ComponentTreeDemoPage = createJsonComponent<ComponentTreeDemoPageProps>(componentTreeDemoPageDef)
export const JSONConversionShowcase = createJsonComponent<JSONConversionShowcaseProps>(jsonConversionShowcaseDef)
export const JSONLambdaDesigner = createJsonComponent<JSONLambdaDesignerProps>(jsonLambdaDesignerDef)
export const JSONModelDesigner = createJsonComponent<JSONModelDesignerProps>(jsonModelDesignerDef)
export const JSONWorkflowDesigner = createJsonComponent<JSONWorkflowDesignerProps>(jsonWorkflowDesignerDef)
export const JSONComponentTreeManager = createJsonComponent<JSONComponentTreeManagerProps>(jsonComponentTreeManagerDef)
export const SassStylesShowcase = createJsonComponent<SassStylesShowcaseProps>(sassStylesShowcaseDef)
export const AtomicComponentShowcase = createJsonComponent<AtomicComponentShowcaseProps>(atomicComponentShowcaseDef)
export const JSONUIShowcasePage = createJsonComponent<JSONUIShowcasePageProps>(jsonUiShowcasePageDef)
export const JSONDemoPage = createJsonComponent<JSONDemoPageProps>(jsonDemoPageDef)
export const DashboardDemoPage = createJsonComponent<DashboardDemoPageProps>(dashboardDemoPageDef)
export const ComprehensiveDemoPage = createJsonComponent<ComprehensiveDemoPageProps>(comprehensiveDemoPageDef)
export const TemplateExplorer = createJsonComponent<TemplateExplorerProps>(templateExplorerDef)
export const ProjectManager = createJsonComponent<ProjectManagerProps>(projectManagerDef)
export const StorageSettingsPanel = createJsonComponent<StorageSettingsPanelProps>(storageSettingsPanelDef)
export const FeatureToggleSettings = createJsonComponent<FeatureToggleSettingsProps>(featureToggleSettingsDef)

export const DocumentationView = createJsonComponentWithHooks<DocumentationViewProps>(documentationViewDef, {
  hooks: {
    viewState: {
      hookName: 'useDocumentationView',
      args: () => []
    }
  }
})

export const DockerBuildDebugger = createJsonComponentWithHooks<DockerBuildDebuggerProps>(dockerBuildDebuggerDef, {
  hooks: {
    debuggerState: {
      hookName: 'useDockerBuildDebugger',
      args: () => []
    }
  }
})

export const DataBindingDesigner = createJsonComponentWithHooks<DataBindingDesignerProps>(dataBindingDesignerDef, {
  hooks: {
    designerState: {
      hookName: 'useDataBindingDesigner',
      args: () => []
    }
  }
})

export const ErrorPanelMain = createJsonComponentWithHooks<ErrorPanelMainProps>(errorPanelMainDef, {
  hooks: {
    panelState: {
      hookName: 'useErrorPanelMain',
      args: (props) => [props.files, props.onFileChange, props.onFileSelect]
    }
  }
})

export const FaviconDesigner = createJsonComponentWithHooks<FaviconDesignerProps>(faviconDesignerDef, {
  hooks: {
    designerState: {
      hookName: 'useFaviconDesigner',
      args: () => []
    }
  }
})

export const FeatureIdeaCloud = createJsonComponentWithHooks<FeatureIdeaCloudProps>(featureIdeaCloudDef, {
  hooks: {
    cloudState: {
      hookName: 'useFeatureIdeaCloud',
      args: () => []
    }
  }
})

// All components converted to pure JSON! 🎉
