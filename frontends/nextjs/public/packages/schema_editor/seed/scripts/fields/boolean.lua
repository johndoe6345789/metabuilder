-- Schema field boolean type

---@class BooleanFieldDefinition
---@field type "boolean" Field type identifier
---@field name string Field name
---@field required boolean Whether field is required
---@field default boolean? Default value for the field

---Creates a boolean field definition for schema
---@param name string Field name
---@param required boolean? Whether field is required (default false)
---@param default_value boolean? Default value for the field
---@return BooleanFieldDefinition
local function boolean_field(name, required, default_value)
  return {
    type = "boolean",
    name = name,
    required = required or false,
    default = default_value
  }
end

return boolean_field
