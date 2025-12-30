-- Contact form configuration and logic
local validate = require("validate")
local json = require("json")
local M = {}

-- Load config from JSON file
M.config = json.load("contact_form.json")

-- Create initial empty form state
function M.createInitialState()
  local state = {}
  for _, field in ipairs(M.config.fields) do
    state[field.name] = ""
  end
  return state
end

-- Validate the contact form
function M.validate(formValues)
  local errors = {}
  local emailPattern = "^[^%s@]+@[^%s@]+%.[^%s@]+$"
  
  for _, field in ipairs(M.config.fields) do
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

-- Handle form submission
function M.handleSubmit(formValues)
  local validation = M.validate(formValues)
  
  if not validation.valid then
    return {
      success = false,
      errors = validation.errors
    }
  end
  
  log("Contact form submitted: " .. (formValues.email or "unknown"))
  
  return {
    success = true,
    message = M.config.successMessage,
    data = formValues
  }
end

return M
