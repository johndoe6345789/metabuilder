// TODO: Implement useLevelRouting
export function useLevelRouting() {
  return {  canAccess: () => true }
}

export type LevelRouting = ReturnType<typeof useLevelRouting>
