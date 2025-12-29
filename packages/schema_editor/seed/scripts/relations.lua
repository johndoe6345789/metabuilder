-- Table relationships
local M = {}

M.ONE_TO_ONE = "one_to_one"
M.ONE_TO_MANY = "one_to_many"
M.MANY_TO_MANY = "many_to_many"

function M.define(type, from, to, options)
  return {
    type = type,
    from_table = from.table,
    from_field = from.field,
    to_table = to.table,
    to_field = to.field,
    cascade = options and options.cascade or false
  }
end

function M.has_one(from, to)
  return M.define(M.ONE_TO_ONE, from, to)
end

function M.has_many(from, to)
  return M.define(M.ONE_TO_MANY, from, to)
end

function M.belongs_to_many(from, to, pivot)
  local rel = M.define(M.MANY_TO_MANY, from, to)
  rel.pivot_table = pivot
  return rel
end

return M
