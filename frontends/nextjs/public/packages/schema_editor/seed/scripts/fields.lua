-- Schema field types

---@alias FieldType "string" | "integer" | "float" | "boolean" | "date" | "datetime" | "text" | "json"

---@class FieldOptions
---@field nullable? boolean Whether field can be null
---@field default? any Default value for field
---@field unique? boolean Whether field must be unique

---@class FieldReference
---@field table string Referenced table name
---@field field string Referenced field name

---@class FieldDefinition
---@field name string Field name
---@field type FieldType Field type
---@field nullable boolean Whether field can be null
---@field default? any Default value
---@field unique boolean Whether field must be unique
---@field references? FieldReference Foreign key reference

---@class FieldsModule
---@field STRING string
---@field INTEGER string
---@field FLOAT string
---@field BOOLEAN string
---@field DATE string
---@field DATETIME string
---@field TEXT string
---@field JSON string
local M = {}

M.STRING = "string"
M.INTEGER = "integer"
M.FLOAT = "float"
M.BOOLEAN = "boolean"
M.DATE = "date"
M.DATETIME = "datetime"
M.TEXT = "text"
M.JSON = "json"

---Define a schema field
---@param name string Field name
---@param type FieldType Field type
---@param options? FieldOptions Field options
---@return FieldDefinition
function M.define(name, type, options)
  return {
    name = name,
    type = type,
    nullable = options and options.nullable or false,
    default = options and options.default,
    unique = options and options.unique or false
  }
end

---Create a primary key field
---@param name string Field name
---@return FieldDefinition
function M.primary_key(name)
  return M.define(name, M.INTEGER, { nullable = false, unique = true })
end

---Create a foreign key field
---@param name string Field name
---@param ref_table string Referenced table name
---@param ref_field string Referenced field name
---@return FieldDefinition
function M.foreign_key(name, ref_table, ref_field)
  local field = M.define(name, M.INTEGER, { nullable = true })
  field.references = { table = ref_table, field = ref_field }
  return field
end

return M
