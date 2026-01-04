// TODO: Implement useResolvedUser
export function useResolvedUser() {
  return { user: null, isLoading: false }
}

export type ResolvedUserState = ReturnType<typeof useResolvedUser>
