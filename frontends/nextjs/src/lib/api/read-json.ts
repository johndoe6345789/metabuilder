// TODO: Implement JSON reading utility
export const readJson = async <T = any>(body: ReadableStream | null): Promise<T> => {
  if (!body) return {} as T
  const text = await new Response(body).text()
  return JSON.parse(text)
}
