/**
 * useProjectState — central hook for all project-level state.
 * Selectors: use-project-selectors.ts
 * Callbacks: use-project-callbacks.ts
 * Defaults: use-project-defaults.ts
 */
import {
  DEFAULT_THEME, DEFAULT_FILES,
  DEFAULT_FLASK_CONFIG, DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS, DEFAULT_FEATURE_TOGGLES,
} from './use-project-defaults'
import { useProjectSelectors } from './use-project-selectors'
import { useProjectCallbacks } from './use-project-callbacks'

export { DEFAULT_THEME, DEFAULT_FILES }

export function useProjectState() {
  const sel = useProjectSelectors()
  const cb = useProjectCallbacks(sel)

  return {
    files: sel.safeFiles, setFiles: cb.setFiles,
    models: sel.safeModels, setModels: cb.setModels,
    components: sel.safeComponents,
    setComponents: cb.setComponents,
    componentTrees: sel.safeComponentTrees,
    setComponentTrees: sel.setComponentTrees,
    workflows: sel.safeWorkflows,
    setWorkflows: cb.setWorkflows,
    lambdas: sel.safeLambdas, setLambdas: cb.setLambdas,
    theme: sel.safeTheme, setTheme: sel.setTheme,
    playwrightTests: sel.safePlaywrightTests,
    setPlaywrightTests: cb.setPlaywrightTests,
    storybookStories: sel.safeStorybookStories,
    setStorybookStories: cb.setStorybookStories,
    unitTests: sel.safeUnitTests,
    setUnitTests: cb.setUnitTests,
    flaskConfig: sel.safeFlaskConfig,
    setFlaskConfig: cb.setFlaskConfig,
    nextjsConfig: sel.safeNextjsConfig,
    setNextjsConfig: cb.setNextjsConfig,
    npmSettings: sel.safeNpmSettings,
    setNpmSettings: cb.setNpmSettings,
    featureToggles: sel.safeFeatureToggles,
    setFeatureToggles: cb.setFeatureToggles,
    defaults: {
      DEFAULT_FLASK_CONFIG,
      DEFAULT_NEXTJS_CONFIG,
      DEFAULT_NPM_SETTINGS,
      DEFAULT_FEATURE_TOGGLES,
      DEFAULT_THEME,
      DEFAULT_FILES,
    },
  }
}
