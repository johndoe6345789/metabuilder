-- Schema field string type

---@class StringFieldDefinition
---@field type "string" Field type identifier
---@field name string Field name
---@field required boolean Whether field is required
---@field minLength number? Minimum string length
---@field maxLength number? Maximum string length

---Creates a string field definition for schema
---@param name string Field name
---@param required boolean? Whether field is required (default false)
---@param min_length number? Minimum string length
---@param max_length number? Maximum string length
---@return StringFieldDefinition
local function string_field(name, required, min_length, max_length)
  return {
    type = "string",
    name = name,
    required = required or false,
    minLength = min_length,
    maxLength = max_length
  }
end

return string_field
