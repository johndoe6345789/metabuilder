-- Schema field string type
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
