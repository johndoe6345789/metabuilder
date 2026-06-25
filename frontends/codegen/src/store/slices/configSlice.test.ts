import { describe, expect, it } from 'vitest'
import reducer, {
  setFlaskConfig,
  setNextjsConfig,
  setNpmSettings,
  setFeatureToggles,
  DEFAULT_FLASK_CONFIG,
  DEFAULT_NEXTJS_CONFIG,
  DEFAULT_NPM_SETTINGS,
  DEFAULT_FEATURE_TOGGLES,
} from './configSlice'
import type { FlaskConfig, NextJsConfig } from '@/types/project'

describe('configSlice reducer', () => {
  it('returns initial state with defaults', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.flaskConfig).toEqual(DEFAULT_FLASK_CONFIG)
    expect(state.nextjsConfig).toEqual(DEFAULT_NEXTJS_CONFIG)
    expect(state.npmSettings).toEqual(DEFAULT_NPM_SETTINGS)
    expect(state.featureToggles).toEqual(DEFAULT_FEATURE_TOGGLES)
  })

  describe('setFlaskConfig', () => {
    it('replaces flask config with a plain object', () => {
      const newConfig: FlaskConfig = {
        blueprints: [],
        port: 8080,
        debug: false,
      }
      const state = reducer(undefined, setFlaskConfig(newConfig))
      expect(state.flaskConfig.port).toBe(8080)
      expect(state.flaskConfig.debug).toBe(false)
    })

    it('supports updater function to merge partial updates', () => {
      const state = reducer(
        undefined,
        setFlaskConfig((current) => ({ ...current, port: 9000 }))
      )
      expect(state.flaskConfig.port).toBe(9000)
      // other defaults preserved
      expect(state.flaskConfig.debug).toBe(DEFAULT_FLASK_CONFIG.debug)
    })
  })

  describe('setNextjsConfig', () => {
    it('replaces nextjs config with plain object', () => {
      const newConfig: NextJsConfig = {
        appName: 'my-app',
        typescript: false,
        eslint: false,
        tailwind: false,
        srcDirectory: false,
        appRouter: false,
        importAlias: '@/',
      }
      const state = reducer(undefined, setNextjsConfig(newConfig))
      expect(state.nextjsConfig.appName).toBe('my-app')
      expect(state.nextjsConfig.typescript).toBe(false)
    })

    it('supports updater function', () => {
      const state = reducer(
        undefined,
        setNextjsConfig((current) => ({ ...current, appName: 'updated-name' }))
      )
      expect(state.nextjsConfig.appName).toBe('updated-name')
    })
  })

  describe('setNpmSettings', () => {
    it('replaces npm settings', () => {
      const state = reducer(
        undefined,
        setNpmSettings({ packages: [], scripts: {}, packageManager: 'yarn' })
      )
      expect(state.npmSettings.packageManager).toBe('yarn')
      expect(state.npmSettings.packages).toHaveLength(0)
    })

    it('supports updater function', () => {
      const state = reducer(
        undefined,
        setNpmSettings((current) => ({ ...current, packageManager: 'pnpm' }))
      )
      expect(state.npmSettings.packageManager).toBe('pnpm')
    })
  })

  describe('setFeatureToggles', () => {
    it('replaces feature toggles', () => {
      const toggles = { ...DEFAULT_FEATURE_TOGGLES, codeEditor: false }
      const state = reducer(undefined, setFeatureToggles(toggles))
      expect(state.featureToggles.codeEditor).toBe(false)
    })

    it('supports updater function', () => {
      const state = reducer(
        undefined,
        setFeatureToggles((current) => ({ ...current, workflows: false }))
      )
      expect(state.featureToggles.workflows).toBe(false)
      expect(state.featureToggles.models).toBe(DEFAULT_FEATURE_TOGGLES.models)
    })
  })
})
