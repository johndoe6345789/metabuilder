/**
 * Widget components D–P: docker, docs, favicon, features, persistence.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  DockerBuildDebuggerProps, DocumentationViewProps,
  EmptyCanvasStateProps, FaviconDesignerProps,
  FeatureIdeaCloudProps, FeatureToggleSettingsProps,
  GitHubBuildStatusProps, KeyboardShortcutsDialogProps,
  PreviewDialogProps,
} from './interfaces'
import dockerBuildDebuggerDef from
  '@/components/json-definitions/docker-build-debugger.json'
import documentationViewDef from
  '@/components/json-definitions/documentation-view.json'
import emptyCanvasStateDef from
  '@/components/json-definitions/empty-canvas-state.json'
import faviconDesignerDef from
  '@/components/json-definitions/favicon-designer.json'
import featureIdeaCloudDef from
  '@/components/json-definitions/feature-idea-cloud.json'
import featureToggleSettingsDef from
  '@/components/json-definitions/feature-toggle-settings.json'
import githubBuildStatusDef from
  '@/components/json-definitions/github-build-status.json'
import keyboardShortcutsDialogDef from
  '@/components/json-definitions/keyboard-shortcuts-dialog.json'
import previewDialogDef from
  '@/components/json-definitions/preview-dialog.json'

export const MetabuilderWidgetDockerBuildDebugger =
  createJsonComponentWithHooks<DockerBuildDebuggerProps>(
    dockerBuildDebuggerDef,
    { hooks: { debuggerState: {
      hookName: 'useDockerBuildDebugger',
      args: () => [],
    } } },
  )
export const MetabuilderWidgetDocumentationView =
  createJsonComponentWithHooks<DocumentationViewProps>(
    documentationViewDef,
    { hooks: { viewState: {
      hookName: 'useDocumentationView',
      args: () => [], spread: true,
    } } },
  )
export const MetabuilderFeedbackEmptyCanvasState =
  createJsonComponent<EmptyCanvasStateProps>(
    emptyCanvasStateDef,
  )
export const MetabuilderWidgetFaviconDesigner =
  createJsonComponentWithHooks<FaviconDesignerProps>(
    faviconDesignerDef,
    { hooks: { designerState: {
      hookName: 'useFaviconDesigner',
      args: () => [],
    } } },
  )
export const MetabuilderWidgetFeatureIdeaCloud =
  createJsonComponentWithHooks<FeatureIdeaCloudProps>(
    featureIdeaCloudDef,
    { hooks: { cloudState: {
      hookName: 'useFeatureIdeaCloud',
      args: () => [],
    } } },
  )
export const MetabuilderWidgetFeatureToggleSettings =
  createJsonComponentWithHooks<FeatureToggleSettingsProps>(
    featureToggleSettingsDef,
    { hooks: { toggleState: {
      hookName: 'useFeatureToggleSettings',
      args: (p) => [p.features, p.onFeaturesChange],
      spread: true,
    } } },
  )
export const MetabuilderFeedbackGitHubBuildStatus =
  createJsonComponent<GitHubBuildStatusProps>(
    githubBuildStatusDef,
  )
export const MetabuilderWidgetKeyboardShortcutsDialog =
  createJsonComponent<KeyboardShortcutsDialogProps>(
    keyboardShortcutsDialogDef,
  )
export const MetabuilderWidgetPreviewDialog =
  createJsonComponent<PreviewDialogProps>(previewDialogDef)
