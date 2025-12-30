-- Schema field number type
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
