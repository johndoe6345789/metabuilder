-- Schema field types
local M = {}

M.STRING = "string"
M.INTEGER = "integer"
M.FLOAT = "float"
M.BOOLEAN = "boolean"
M.DATE = "date"
M.DATETIME = "datetime"
M.TEXT = "text"
M.JSON = "json"

function M.define(name, type, options)
  return {
    name = name,
    type = type,
    nullable = options and options.nullable or false,
    default = options and options.default,
    unique = options and options.unique or false
  }
end

function M.primary_key(name)
  return M.define(name, M.INTEGER, { nullable = false, unique = true })
end

function M.foreign_key(name, ref_table, ref_field)
  local field = M.define(name, M.INTEGER, { nullable = true })
  field.references = { table = ref_table, field = ref_field }
  return field
end

return M
