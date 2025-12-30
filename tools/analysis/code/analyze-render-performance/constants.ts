export const BUILTIN_HOOKS = [
  'useState',
  'useReducer',
  'useEffect',
  'useLayoutEffect',
  'useInsertionEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useContext',
  'useSyncExternalStore',
  'useTransition',
  'useDeferredValue',
  'useId',
  'useImperativeHandle',
]

export const BUILTIN_HOOK_SET = new Set(BUILTIN_HOOKS)
export const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  '__tests__',
  '__mocks__',
  '__snapshots__',
])

export const THRESHOLDS = {
  slowRenderMs: 16,
  largeComponentLines: 200,
  veryLargeComponentLines: 300,
  highHookCount: 12,
  highEffectCount: 3,
}

export const TARGET_EXTENSIONS = new Set(['.tsx'])
