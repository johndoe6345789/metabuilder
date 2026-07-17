import uiReducer from './slices/uiSlice';

export const rootReducers = {
  ui: uiReducer,
};

export const persistWhitelist = Object.keys(rootReducers);
