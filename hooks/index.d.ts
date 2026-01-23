import { TypedUseSelectorHook } from 'react-redux';
export type RootState = any;
export type AppDispatch = any;
export declare const useAppDispatch: () => any;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
export declare function createAppStore(reducers: any, preloadedState?: any): import("@reduxjs/toolkit").EnhancedStore<any, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: {};
}>, import("redux").StoreEnhancer]>>;
export type AppStore = ReturnType<typeof createAppStore>;
export { getMiddlewareConfig, getDevToolsConfig } from '../middleware';
//# sourceMappingURL=index.d.ts.map