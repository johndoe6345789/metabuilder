/**
 * Type stub for @/hooks/use-kv
 * Key-value storage hook used by useFaviconDesigner.
 */

type Updater<T> = T | ((current: T) => T)

/**
 * Hook for persistent key-value storage.
 * Returns a stateful value and a setter that persists to storage.
 */
export declare function useKV<T>(
  key: string,
  defaultValue: T
): [T, (updater: Updater<T>) => void]
