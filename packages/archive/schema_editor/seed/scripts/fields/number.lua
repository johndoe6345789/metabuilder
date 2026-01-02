-- Schema field number type

---@class NumberFieldDefinition
---@field type "number" Field type identifier
---@field name string Field name
---@field required boolean Whether field is required
---@field min number? Minimum allowed value
---@field max number? Maximum allowed value

---Creates a number field definition for schema
---@param name string Field name
---@param required boolean? Whether field is required (default false)
---@param min number? Minimum allowed value
---@param max number? Maximum allowed value
---@return NumberFieldDefinition
local function number_field(name, required, min, max)
  return {
    type = "number",
    name = name,
    required = required or false,
    min = min,
    max = max
  }
end

return number_field
