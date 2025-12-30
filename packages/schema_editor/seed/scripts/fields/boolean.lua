-- Schema field boolean type
local function boolean_field(name, required, default_value)
  return {
    type = "boolean",
    name = name,
    required = required or false,
    default = default_value
  }
end

return boolean_field
