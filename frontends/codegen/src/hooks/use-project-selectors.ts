/**
 * useProjectSelectors — Redux slice selectors + safe-value
 * fallbacks for useProjectState.
 */
import { useAppSelector } from '@/store'
import { useUIState } from '@/hooks/use-ui-state'
import type { ComponentTree, ThemeConfig } from '@/types/project'
import {
  DEFAULT_THEME,
  DEFAULT_FILES,
  DEFAULT_MODELS,
  DEFAULT_COMPONENTS,
  DEFAULT_WORKFLOWS,
  DEFAULT_FLASK_CONFIG,
  DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
} from './use-project-defaults'

const DEFAULT_COMPONENT_TREE: ComponentTree = {
  id: 'default-tree',
  name: 'Main App',
  description: 'Default component tree',
  rootNodes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export function useProjectSelectors() {
  const sliceFiles =
    useAppSelector((s) => s.files?.files ?? [])
  const sliceModels =
    useAppSelector((s) => s.models?.models ?? [])
  const sliceComponents =
    useAppSelector((s) => s.components?.components ?? [])
  const sliceWorkflows =
    useAppSelector((s) => s.workflows?.workflows ?? [])
  const sliceLambdas =
    useAppSelector((s) => s.lambdas?.lambdas ?? [])
  const slicePlaywrightTests =
    useAppSelector((s) => s.tests?.playwrightTests ?? [])
  const sliceStorybookStories =
    useAppSelector((s) => s.tests?.storybookStories ?? [])
  const sliceUnitTests =
    useAppSelector((s) => s.tests?.unitTests ?? [])
  const sliceFlaskConfig = useAppSelector(
    (s) => s.config?.flaskConfig ?? DEFAULT_FLASK_CONFIG,
  )
  const sliceNextjsConfig = useAppSelector(
    (s) => s.config?.nextjsConfig ?? DEFAULT_NEXTJS_CONFIG,
  )
  const sliceNpmSettings = useAppSelector(
    (s) => s.config?.npmSettings ?? DEFAULT_NPM_SETTINGS,
  )
  const sliceFeatureToggles = useAppSelector(
    (s) =>
      s.config?.featureToggles ?? DEFAULT_FEATURE_TOGGLES,
  )

  const [componentTrees, setComponentTrees] =
    useUIState<ComponentTree[]>('project-component-trees', [
      DEFAULT_COMPONENT_TREE,
    ])
  const [theme, setTheme] =
    useUIState<ThemeConfig>('project-theme', DEFAULT_THEME)

  return {
    safeFiles:
      Array.isArray(sliceFiles) && sliceFiles.length > 0
        ? sliceFiles : DEFAULT_FILES,
    safeModels:
      Array.isArray(sliceModels) && sliceModels.length > 0
        ? sliceModels : DEFAULT_MODELS,
    safeComponents:
      Array.isArray(sliceComponents) &&
      sliceComponents.length > 0
        ? sliceComponents : DEFAULT_COMPONENTS,
    safeWorkflows:
      Array.isArray(sliceWorkflows) &&
      sliceWorkflows.length > 0
        ? sliceWorkflows : DEFAULT_WORKFLOWS,
    safeLambdas: Array.isArray(sliceLambdas)
      ? sliceLambdas : [],
    safeComponentTrees: Array.isArray(componentTrees)
      ? componentTrees : [],
    setComponentTrees,
    safeTheme:
      (theme as ThemeConfig)?.variants?.length > 0
        ? theme : DEFAULT_THEME,
    setTheme,
    safePlaywrightTests: Array.isArray(slicePlaywrightTests)
      ? slicePlaywrightTests : [],
    safeStorybookStories: Array.isArray(sliceStorybookStories)
      ? sliceStorybookStories : [],
    safeUnitTests: Array.isArray(sliceUnitTests)
      ? sliceUnitTests : [],
    safeFlaskConfig: sliceFlaskConfig || DEFAULT_FLASK_CONFIG,
    safeNextjsConfig:
      sliceNextjsConfig || DEFAULT_NEXTJS_CONFIG,
    safeNpmSettings: sliceNpmSettings || DEFAULT_NPM_SETTINGS,
    safeFeatureToggles:
      sliceFeatureToggles || DEFAULT_FEATURE_TOGGLES,
  }
}
