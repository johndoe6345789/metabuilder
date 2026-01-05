/**
 * useKV hook (stub)
 */

export function useKV(namespace?: string) {
  // TODO: Implement useKV
  return {
    get: async (key: string) => null,
    set: async (key: string, value: unknown) => {},
    delete: async (key: string) => {},
    list: async (prefix?: string) => [],
  }
}
