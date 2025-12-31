-- Create initial empty form state
require("contact_form.types")
local json = require("json")

---@class InitialStateModule
local M = {}

---@type FormConfig
local config = json.load("contact_form.json")

---@return FormState
function M.create()
  local state = {}
  for _, field in ipairs(config.fields) do
    state[field.name] = ""
  end
  return state
end

return M
