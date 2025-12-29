import { LuaSnippet } from './types'

export const ARRAY_OPERATION_SNIPPETS: LuaSnippet[] = [
  {
    id: 'array_filter',
    name: 'Filter Array',
    description: 'Filter array elements by condition',
    category: 'Array Operations',
    tags: ['array', 'filter', 'collection'],
    parameters: [
      { name: 'items', type: 'array', description: 'Array to filter' },
      { name: 'minValue', type: 'number', description: 'Minimum value threshold' },
    ],
    code: `local items = context.data.items or {}
local minValue = context.data.minValue or 0
local filtered = {}

for i, item in ipairs(items) do
  if item.value >= minValue then
    table.insert(filtered, item)
  end
end

log("Filtered " .. #filtered .. " of " .. #items .. " items")

return {
  original = items,
  filtered = filtered,
  count = #filtered
}`,
  },
  {
    id: 'array_map',
    name: 'Map Array',
    description: 'Transform each array element',
    category: 'Array Operations',
    tags: ['array', 'map', 'transform'],
    code: `local items = context.data.items or {}
local mapped = {}

for i, item in ipairs(items) do
  table.insert(mapped, {
    id = item.id,
    label = string.upper(item.name or ""),
    value = (item.value or 0) * 2,
    index = i
  })
end

return {
  original = items,
  mapped = mapped
}`,
  },
  {
    id: 'array_reduce',
    name: 'Reduce Array to Sum',
    description: 'Calculate sum of numeric array values',
    category: 'Array Operations',
    tags: ['array', 'reduce', 'sum'],
    parameters: [{ name: 'numbers', type: 'array', description: 'Array of numbers' }],
    code: `local numbers = context.data.numbers or {}
local sum = 0
local count = 0

for i, num in ipairs(numbers) do
  sum = sum + (num or 0)
  count = count + 1
end

local average = count > 0 and sum / count or 0

return {
  sum = sum,
  count = count,
  average = average
}`,
  },
  {
    id: 'array_group_by',
    name: 'Group Array by Property',
    description: 'Group array items by a property value',
    category: 'Array Operations',
    tags: ['array', 'group', 'aggregate'],
    code: `local items = context.data.items or {}
local groupKey = context.data.groupKey or "category"
local groups = {}

for i, item in ipairs(items) do
  local key = item[groupKey] or "uncategorized"

  if not groups[key] then
    groups[key] = {}
  end

  table.insert(groups[key], item)
end

local summary = {}
for key, group in pairs(groups) do
  summary[key] = #group
end

return {
  groups = groups,
  summary = summary
}`,
  },
  {
    id: 'array_sort',
    name: 'Sort Array',
    description: 'Sort array by property value',
    category: 'Array Operations',
    tags: ['array', 'sort', 'order'],
    code: `local items = context.data.items or {}
local sortKey = context.data.sortKey or "value"
local descending = context.data.descending or false

table.sort(items, function(a, b)
  if descending then
    return (a[sortKey] or 0) > (b[sortKey] or 0)
  else
    return (a[sortKey] or 0) < (b[sortKey] or 0)
  end
end)

return {
  sorted = items,
  count = #items
}`,
  },
]
