-- Validate the contact form
require("contact_form.types")
local json = require("json")

---@class ValidateModule
local M = {}

---@type FormConfig
local config = json.load("contact_form.json")

---@param formValues FormState
---@return FormValidation
function M.validate(formValues)
  local errors = {}
  local emailPattern = "^[^%s@]+@[^%s@]+%.[^%s@]+$"

  for _, field in ipairs(config.fields) do
    local value = formValues[field.name]
    value = value and string.gsub(value, "^%s*(.-)%s*$", "%1") or ""

    if field.required and value == "" then
      errors[field.name] = field.label .. " is required"
    elseif field.type == "email" and value ~= "" then
      if not string.match(value, emailPattern) then
        errors[field.name] = "Enter a valid email address"
      end
    end
  end

  return { valid = next(errors) == nil, errors = errors }
end

return M
