/**
 * Typed defaults from project-defaults.json for useProjectState.
 */
import type {
  ProjectFile,
  DbModel,
  ComponentNode,
  Workflow,
  ThemeConfig,
} from '@/types/project'
import defaults from '@/data/project-defaults.json'
import {
  DEFAULT_FLASK_CONFIG,
  DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
} from '@/store/slices/configSlice'

export const DEFAULT_THEME =
  defaults.theme as unknown as ThemeConfig
export const DEFAULT_FILES =
  defaults.files as unknown as ProjectFile[]
export const DEFAULT_MODELS =
  defaults.models as unknown as DbModel[]
export const DEFAULT_COMPONENTS =
  defaults.components as unknown as ComponentNode[]
export const DEFAULT_WORKFLOWS =
  defaults.workflows as unknown as Workflow[]

export {
  DEFAULT_FLASK_CONFIG,
  DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
}

/** Factory for Redux dispatch setters that support updater functions. */
export function makeDispatchSetter<T>(
  dispatch: (...args: any[]) => any,
  action: (v: any) => any,
  currentValue: T,
) {
  return (value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      const fn = value as (prev: T) => T
      dispatch(action(fn(currentValue)))
    } else {
      dispatch(action(value))
    }
  }
}
