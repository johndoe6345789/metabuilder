-- Schema field array type

---@class ArrayFieldItems
---@field type string The type of items in the array

---@class ArrayFieldDefinition
---@field type "array" Field type identifier
---@field name string Field name
---@field items ArrayFieldItems Items type definition
---@field required boolean Whether field is required

---Creates an array field definition for schema
---@param name string Field name
---@param items_type string Type of items in the array (e.g. "string", "number")
---@param required boolean? Whether field is required (default false)
---@return ArrayFieldDefinition
local function array_field(name, items_type, required)
  return {
    type = "array",
    name = name,
    items = { type = items_type },
    required = required or false
  }
end

return array_field
