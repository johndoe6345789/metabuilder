import { LuaSnippet } from './types'

export const DATA_TRANSFORMATION_SNIPPETS: LuaSnippet[] = [
  {
    id: 'transform_snake_to_camel',
    name: 'Snake Case to Camel Case',
    description: 'Convert snake_case strings to camelCase',
    category: 'Data Transformation',
    tags: ['transform', 'string', 'case'],
    parameters: [
      { name: 'text', type: 'string', description: 'Snake case text' }
    ],
    code: `local text = context.data.text or ""

local result = string.gsub(text, "_(%w)", function(c)
  return string.upper(c)
end)

return {
  original = text,
  transformed = result
}`
  },
  {
    id: 'transform_flatten_object',
    name: 'Flatten Nested Object',
    description: 'Convert nested table to flat key-value pairs',
    category: 'Data Transformation',
    tags: ['transform', 'object', 'flatten'],
    code: `local function flatten(tbl, prefix, result)
  result = result or {}
  prefix = prefix or ""

  for key, value in pairs(tbl) do
    local newKey = prefix == "" and key or prefix .. "." .. key

    if type(value) == "table" then
      flatten(value, newKey, result)
    else
      result[newKey] = value
    end
  end

  return result
end

local data = context.data or {}
local flattened = flatten(data)

return {
  original = data,
  flattened = flattened
}`
  },
  {
    id: 'transform_normalize_data',
    name: 'Normalize User Data',
    description: 'Clean and normalize user input data',
    category: 'Data Transformation',
    tags: ['transform', 'normalize', 'clean'],
    code: `local data = context.data or {}

local function trim(s)
  return string.match(s, "^%s*(.-)%s*$")
end

local normalized = {}

if data.email then
  normalized.email = string.lower(trim(data.email))
end

if data.name then
  normalized.name = trim(data.name)
  local words = {}
  for word in string.gmatch(normalized.name, "%S+") do
    table.insert(words, string.upper(string.sub(word, 1, 1)) .. string.lower(string.sub(word, 2)))
  end
  normalized.name = table.concat(words, " ")
end

if data.phone then
  normalized.phone = string.gsub(data.phone, "[^%d]", "")
end

return normalized`
  }
]
