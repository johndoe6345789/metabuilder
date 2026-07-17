import { createPersistedStore } from '@metabuilder/redux-persist';
import { rootReducers, persistWhitelist } from './rootReducer';

const { store, persistor } = createPersistedStore({
  reducers: rootReducers,
  persist: {
    key: 'postgres-dashboard-v2',
    whitelist: persistWhitelist,
    throttle: 200,
  },
});

export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
