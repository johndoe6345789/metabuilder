export const mergeRecords = <T>(
  current: Record<string, T>,
  incoming: Record<string, T>
): Record<string, T> => {
  return {
    ...current,
    ...incoming,
  }
}
