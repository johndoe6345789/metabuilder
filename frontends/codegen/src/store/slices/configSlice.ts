/**
 * configSlice — persisted state for project configuration
 *
 * Covers Flask config, Next.js config, npm settings, and feature toggles.
 * Replaces the untyped useKV calls for these values.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FlaskConfig, NextJsConfig, NpmSettings, FeatureToggles } from '@/types/project'

const DEFAULT_FLASK_CONFIG: FlaskConfig = {
  blueprints: [],
  corsOrigins: ['http://localhost:3000'],
  enableSwagger: true,
  port: 5000,
  debug: true,
}

const DEFAULT_NEXTJS_CONFIG: NextJsConfig = {
  appName: 'my-nextjs-app',
  typescript: true,
  eslint: true,
  tailwind: true,
  srcDirectory: true,
  appRouter: true,
  importAlias: '@/*',
  turbopack: false,
  githubRepo: {
    owner: 'johndoe6345789',
    repo: 'low-code-react-app-b',
  },
}

const DEFAULT_NPM_SETTINGS: NpmSettings = {
  packages: [
    { id: '1', name: 'react', version: '^18.2.0', isDev: false },
    { id: '2', name: 'react-dom', version: '^18.2.0', isDev: false },
    { id: '3', name: 'next', version: '^14.0.0', isDev: false },
    { id: '4', name: '@mui/material', version: '^5.14.0', isDev: false },
    { id: '5', name: 'typescript', version: '^5.0.0', isDev: true },
    { id: '6', name: '@types/react', version: '^18.2.0', isDev: true },
  ],
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  packageManager: 'npm',
}

const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  codeEditor: true,
  models: true,
  components: true,
  componentTrees: true,
  workflows: true,
  lambdas: true,
  styling: true,
  flaskApi: true,
  playwright: true,
  storybook: true,
  unitTests: true,
  errorRepair: true,
  documentation: true,
  sassStyles: true,
  faviconDesigner: true,
  ideaCloud: true,
  schemaEditor: true,
  dataBinding: true,
}

interface ConfigState {
  flaskConfig: FlaskConfig
  nextjsConfig: NextJsConfig
  npmSettings: NpmSettings
  featureToggles: FeatureToggles
}

const initialState: ConfigState = {
  flaskConfig: DEFAULT_FLASK_CONFIG,
  nextjsConfig: DEFAULT_NEXTJS_CONFIG,
  npmSettings: DEFAULT_NPM_SETTINGS,
  featureToggles: DEFAULT_FEATURE_TOGGLES,
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setFlaskConfig: (state, action: PayloadAction<FlaskConfig | ((current: FlaskConfig) => FlaskConfig)>) => {
      if (typeof action.payload === 'function') {
        state.flaskConfig = action.payload(state.flaskConfig)
      } else {
        state.flaskConfig = action.payload
      }
    },
    setNextjsConfig: (state, action: PayloadAction<NextJsConfig | ((current: NextJsConfig) => NextJsConfig)>) => {
      if (typeof action.payload === 'function') {
        state.nextjsConfig = action.payload(state.nextjsConfig)
      } else {
        state.nextjsConfig = action.payload
      }
    },
    setNpmSettings: (state, action: PayloadAction<NpmSettings | ((current: NpmSettings) => NpmSettings)>) => {
      if (typeof action.payload === 'function') {
        state.npmSettings = action.payload(state.npmSettings)
      } else {
        state.npmSettings = action.payload
      }
    },
    setFeatureToggles: (state, action: PayloadAction<FeatureToggles | ((current: FeatureToggles) => FeatureToggles)>) => {
      if (typeof action.payload === 'function') {
        state.featureToggles = action.payload(state.featureToggles)
      } else {
        state.featureToggles = action.payload
      }
    },
  },
})

export const { setFlaskConfig, setNextjsConfig, setNpmSettings, setFeatureToggles } = configSlice.actions
export { DEFAULT_FLASK_CONFIG, DEFAULT_NEXTJS_CONFIG, DEFAULT_NPM_SETTINGS, DEFAULT_FEATURE_TOGGLES }
export default configSlice.reducer
