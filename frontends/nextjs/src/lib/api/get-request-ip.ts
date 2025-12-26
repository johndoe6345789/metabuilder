export const getRequestIp = (request: Request): string | undefined => {
  const headerValue =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip')

  if (!headerValue) return undefined

  const [first] = headerValue.split(',')
  const trimmed = first?.trim()
  return trimmed ? trimmed : undefined
}
