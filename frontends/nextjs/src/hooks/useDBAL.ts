/**
 * useDBAL hook (stub)
 */

export function useDBAL() {
  // TODO: Implement useDBAL
  return {
    get: async (entity: string, id: string) => null,
    list: async (entity: string) => [],
    create: async (entity: string, data: unknown) => {},
    update: async (entity: string, id: string, data: unknown) => {},
    delete: async (entity: string, id: string) => {},
  }
}
