export async function loadPackageSeedJson<T>(
  packageId: string,
  relativePath: string,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(`/packages/${packageId}/${relativePath}`)
    if (!response.ok) return fallback
    return (await response.json()) as T
  } catch (error) {
    return fallback
  }
}
