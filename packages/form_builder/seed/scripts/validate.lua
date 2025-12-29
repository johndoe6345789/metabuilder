local M = {}

function M.required(value)
  return value ~= nil and value ~= ""
end

function M.email(value)
  if not value then return false end
  return string.match(value, "^[^@]+@[^@]+%.[^@]+$") ~= nil
end

function M.minLength(value, min)
  return value and #value >= min
end

function M.maxLength(value, max)
  return not value or #value <= max
end

function M.pattern(value, pat)
  return value and string.match(value, pat) ~= nil
end

function M.number(value)
  return tonumber(value) ~= nil
end

function M.range(value, min, max)
  local n = tonumber(value)
  return n and n >= min and n <= max
end

function M.validate_field(value, rules)
  local errors = {}
  for _, rule in ipairs(rules) do
    if rule.type == "required" and not M.required(value) then
      errors[#errors + 1] = rule.message or "Required"
    elseif rule.type == "email" and not M.email(value) then
      errors[#errors + 1] = rule.message or "Invalid email"
    elseif rule.type == "minLength" and not M.minLength(value, rule.min) then
      errors[#errors + 1] = rule.message or ("Min " .. rule.min .. " chars")
    end
  end
  return { valid = #errors == 0, errors = errors }
end

return M
