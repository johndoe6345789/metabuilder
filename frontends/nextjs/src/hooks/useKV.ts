/**
 * useKV hook (stub)
 */

export function useKV(_namespace?: string) {
  // TODO: Implement useKV
  return {
    get: async (_key: string) => null,
    set: async (_key: string, _value: unknown) => {},
    delete: async (_key: string) => {},
    list: async (_prefix?: string) => [],
  }
}
