import type { HttpMethod } from './types'

type ParsedCli = {
  method: HttpMethod
  path: string
  body?: Record<string, unknown>
}

function parseKvPairs(
  parts: string[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const p of parts) {
    if (!p.includes('=')) continue
    const [k, ...v] = p.split('=')
    const raw = v.join('=').replace(/^"|"$/g, '')
    body[k] = raw === 'true' ? true
      : raw === 'false' ? false
      : isNaN(Number(raw)) ? raw
      : Number(raw)
  }
  return body
}

function parseRestSubcommand(parts: string[]): ParsedCli | null {
  if (parts.length < 5) return null
  const [, , tenant, pkg, entity, ...rest] = parts
  let path = `/${tenant}/${pkg}/${entity}`
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE']
  const id = rest.find(
    r => !r.includes('=') && !httpMethods.includes(r.toUpperCase()),
  )
  const methodOverride = rest.find(
    r => httpMethods.includes(r.toUpperCase()),
  )
  if (id) path += `/${id}`
  const method = (methodOverride?.toUpperCase() as HttpMethod) || 'GET'
  const bodyParts = rest.filter(
    r => r.includes('=') && !httpMethods.includes(r.toUpperCase()),
  )
  const body = parseKvPairs(bodyParts)
  return {
    method, path,
    body: Object.keys(body).length ? body : undefined,
  }
}

export function parseCli(input: string): ParsedCli | null {
  const parts = input.trim().split(/\s+/)
  if (parts.length < 2) return null
  if (parts[0].toLowerCase() !== 'dbal') return null

  const sub = parts[1].toLowerCase()
  if (sub === 'ping') return { method: 'GET', path: '/health' }
  if (sub === 'rest') return parseRestSubcommand(parts)

  const entity = parts[2] || 'Snippet'
  const tenant = 'pastebin'
  const pkg = 'pastebin'
  const base = `/${tenant}/${pkg}/${entity}`

  switch (sub) {
    case 'list':
      return { method: 'GET', path: base }
    case 'read':
      return { method: 'GET', path: `${base}/${parts[3] || ''}` }
    case 'create': {
      const body = parseKvPairs(parts.slice(3))
      return { method: 'POST', path: base, body }
    }
    case 'update': {
      const body = parseKvPairs(parts.slice(4))
      return {
        method: 'PUT',
        path: `${base}/${parts[3] || ''}`,
        body,
      }
    }
    case 'delete':
      return {
        method: 'DELETE',
        path: `${base}/${parts[3] || ''}`,
      }
    default:
      return null
  }
}
