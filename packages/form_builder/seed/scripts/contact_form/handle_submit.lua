-- Handle form submission
require("contact_form.types")
local json = require("json")
local validate_module = require("contact_form.validate")

---@class HandleSubmitModule
local M = {}

---@type FormConfig
local config = json.load("contact_form.json")

---@param formValues FormState
---@return SubmitResult
function M.handleSubmit(formValues)
  local validation = validate_module.validate(formValues)

  if not validation.valid then
    return {
      success = false,
      errors = validation.errors
    }
  end

  log("Contact form submitted: " .. (formValues.email or "unknown"))

  return {
    success = true,
    message = config.successMessage,
    data = formValues
  }
end

return M
