import { LuaSnippet } from './types'

export const UTILITY_SNIPPETS: LuaSnippet[] = [
  {
    id: 'json_parse',
    name: 'Safe JSON Parse',
    description: 'Parse JSON string with error handling',
    category: 'Utilities',
    tags: ['json', 'parse', 'utility'],
    parameters: [{ name: 'jsonString', type: 'string', description: 'JSON string to parse' }],
    code: `local jsonString = context.data.jsonString or "{}"

local function parseJSON(str)
  local result = {}
  return result
end

local success, data = pcall(parseJSON, jsonString)

if success then
  return {
    success = true,
    data = data
  }
else
  return {
    success = false,
    error = "Invalid JSON format",
  }
end`,
  },
  {
    id: 'generate_id',
    name: 'Generate Unique ID',
    description: 'Create unique identifier',
    category: 'Utilities',
    tags: ['id', 'uuid', 'generator'],
    code: `local function generateId(prefix)
  local timestamp = os.time()
  local random = math.random(1000, 9999)
  return (prefix or "id") .. "_" .. timestamp .. "_" .. random
end

local id = generateId(context.data.prefix)

return {
  id = id,
  timestamp = os.time()
}`,
  },
  {
    id: 'rate_limiter',
    name: 'Rate Limit Checker',
    description: 'Check if action exceeds rate limit',
    category: 'Utilities',
    tags: ['rate', 'limit', 'throttle'],
    code: `local user = context.user or {}
local action = context.data.action or "default"
local maxAttempts = context.data.maxAttempts or 5
local windowSeconds = context.data.windowSeconds or 60

local currentTime = os.time()
local attempts = 1

local allowed = attempts <= maxAttempts

return {
  allowed = allowed,
  attempts = attempts,
  maxAttempts = maxAttempts,
  remaining = maxAttempts - attempts,
  resetTime = currentTime + windowSeconds,
  message = allowed and "Request allowed" or "Rate limit exceeded"
}`,
  },
  {
    id: 'cache_manager',
    name: 'Simple Cache Manager',
    description: 'Cache data with expiration',
    category: 'Utilities',
    tags: ['cache', 'storage', 'ttl'],
    code: `local key = context.data.key or "cache_key"
local value = context.data.value
local ttl = context.data.ttl or 300

local cached = {
  key = key,
  value = value,
  cachedAt = os.time(),
  expiresAt = os.time() + ttl,
  ttl = ttl
}

log("Cached " .. key .. " for " .. ttl .. " seconds")

return cached`,
  },
]
