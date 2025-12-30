-- Schema field array type
local function array_field(name, items_type, required)
  return {
    type = "array",
    name = name,
    items = { type = items_type },
    required = required or false
  }
end

return array_field
