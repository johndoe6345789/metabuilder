import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { createPersistedStore } from '@metabuilder/redux-persist'
import projectReducer from './slices/projectSlice'
import filesReducer from './slices/filesSlice'
import modelsReducer from './slices/modelsSlice'
import componentsReducer from './slices/componentsSlice'
import componentTreesReducer from './slices/componentTreesSlice'
import workflowsReducer from './slices/workflowsSlice'
import lambdasReducer from './slices/lambdasSlice'
import themeReducer from './slices/themeSlice'
import settingsReducer from './slices/settingsSlice'
import dbalReducer from './slices/dbalSlice'
import conflictsReducer from './slices/conflictsSlice'
import testsReducer from './slices/testsSlice'
import configReducer from './slices/configSlice'
import uiStateReducer from './slices/uiStateSlice'
import translationsReducer from './slices/translationsSlice'
import uiReducer from '@metabuilder/redux-slices/uiSlice'
import { createSyncMonitorMiddleware } from './middleware/syncMonitorMiddleware'
import { createAutoSyncMiddleware } from './middleware/autoSyncMiddleware'

const { store, persistor } = createPersistedStore({
  reducers: {
    project: projectReducer,
    files: filesReducer,
    models: modelsReducer,
    components: componentsReducer,
    componentTrees: componentTreesReducer,
    workflows: workflowsReducer,
    lambdas: lambdasReducer,
    theme: themeReducer,
    settings: settingsReducer,
    dbal: dbalReducer,
    conflicts: conflictsReducer,
    tests: testsReducer,
    config: configReducer,
    uiState: uiStateReducer,
    translations: translationsReducer,
    ui: uiReducer,
  },
  persist: {
    key: 'codeforge',
    whitelist: ['files', 'models', 'components', 'componentTrees', 'workflows', 'lambdas', 'theme', 'settings', 'project', 'tests', 'config', 'uiState', 'translations', 'ui'],
    throttle: 300,
  },
  middleware: (base) =>
    base
      .concat(createSyncMonitorMiddleware())
      .concat(createAutoSyncMiddleware()),
})

export { store, persistor }

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
