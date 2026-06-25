/**
 * useProjectCallbacks — dispatch-backed setters for
 * useProjectState, grouped to keep the main hook lean.
 */
import { useCallback } from 'react'
import { useAppDispatch } from '@/store'
import { setFiles } from '@/store/slices/filesSlice'
import { setModels } from '@/store/slices/modelsSlice'
import { setComponents } from '@/store/slices/componentsSlice'
import { setWorkflows } from '@/store/slices/workflowsSlice'
import { setLambdas } from '@/store/slices/lambdasSlice'
import {
  setPlaywrightTests,
  setStorybookStories,
  setUnitTests,
} from '@/store/slices/testsSlice'
import {
  setFlaskConfig,
  setNextjsConfig,
  setNpmSettings,
  setFeatureToggles,
} from '@/store/slices/configSlice'
import type {
  FlaskConfig, NextJsConfig,
  NpmSettings, FeatureToggles,
} from '@/types/project'
import { makeDispatchSetter } from './use-project-defaults'
import type { useProjectSelectors } from './use-project-selectors'

type Sel = ReturnType<typeof useProjectSelectors>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DS<T> = (v: T | ((p: T) => T)) => any

export function useProjectCallbacks(sel: Sel) {
  const dispatch = useAppDispatch()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setFiles_ = useCallback(
    makeDispatchSetter(dispatch, setFiles, sel.safeFiles),
    [dispatch, sel.safeFiles],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setModels_ = useCallback(
    makeDispatchSetter(dispatch, setModels, sel.safeModels),
    [dispatch, sel.safeModels],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setComponents_ = useCallback(
    makeDispatchSetter(
      dispatch, setComponents, sel.safeComponents,
    ),
    [dispatch, sel.safeComponents],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setWorkflows_ = useCallback(
    makeDispatchSetter(
      dispatch, setWorkflows, sel.safeWorkflows,
    ),
    [dispatch, sel.safeWorkflows],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setLambdas_ = useCallback(
    makeDispatchSetter(dispatch, setLambdas, sel.safeLambdas),
    [dispatch, sel.safeLambdas],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setPwTests_ = useCallback(
    makeDispatchSetter(
      dispatch, setPlaywrightTests,
      sel.safePlaywrightTests,
    ),
    [dispatch, sel.safePlaywrightTests],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSbStories_ = useCallback(
    makeDispatchSetter(
      dispatch, setStorybookStories,
      sel.safeStorybookStories,
    ),
    [dispatch, sel.safeStorybookStories],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setUnitTests_ = useCallback(
    makeDispatchSetter(
      dispatch, setUnitTests, sel.safeUnitTests,
    ),
    [dispatch, sel.safeUnitTests],
  )
  const setFlask_: DS<FlaskConfig> = useCallback(
    (v) => dispatch(setFlaskConfig(v)), [dispatch],
  )
  const setNextjs_: DS<NextJsConfig> = useCallback(
    (v) => dispatch(setNextjsConfig(v)), [dispatch],
  )
  const setNpm_: DS<NpmSettings> = useCallback(
    (v) => dispatch(setNpmSettings(v)), [dispatch],
  )
  const setFeatures_: DS<FeatureToggles> = useCallback(
    (v) => dispatch(setFeatureToggles(v)), [dispatch],
  )

  return {
    setFiles: setFiles_,
    setModels: setModels_,
    setComponents: setComponents_,
    setWorkflows: setWorkflows_,
    setLambdas: setLambdas_,
    setPlaywrightTests: setPwTests_,
    setStorybookStories: setSbStories_,
    setUnitTests: setUnitTests_,
    setFlaskConfig: setFlask_,
    setNextjsConfig: setNextjs_,
    setNpmSettings: setNpm_,
    setFeatureToggles: setFeatures_,
  }
}
