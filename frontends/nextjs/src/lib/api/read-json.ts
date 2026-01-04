// TODO: Implement JSON reading utility
export const readJson = async <T = any>(request: any): Promise<T> => {
  if (!request || !request.body) return {} as T
  const body = request.body
  const text = await new Response(body).text()
  return JSON.parse(text)
}
