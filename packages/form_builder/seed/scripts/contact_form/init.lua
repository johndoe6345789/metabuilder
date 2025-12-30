-- Contact form module
require("contact_form.types")
local json = require("json")

---@class ContactFormModule
---@field config FormConfig
---@field createInitialState fun(): FormState
---@field validate fun(formValues: FormState): FormValidation
---@field handleSubmit fun(formValues: FormState): SubmitResult

---@type ContactFormModule
local M = {
  config = json.load("contact_form.json"),
  createInitialState = require("contact_form.create_initial_state").create,
  validate = require("contact_form.validate").validate,
  handleSubmit = require("contact_form.handle_submit").handleSubmit
}

return M
