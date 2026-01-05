/**
 * useDBAL hook (stub)
 */

export function useDBAL() {
  // TODO: Implement useDBAL
  return {
    get: async (_entity: string, _id: string) => null,
    list: async (_entity: string) => [],
    create: async (_entity: string, _data: unknown) => {},
    update: async (_entity: string, _id: string, _data: unknown) => {},
    delete: async (_entity: string, _id: string) => {},
  }
}
