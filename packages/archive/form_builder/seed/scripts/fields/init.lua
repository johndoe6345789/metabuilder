-- Form fields module
-- Re-exports all field types

---@class FieldsModule
---@field text function
---@field email function
---@field password function
---@field number function
---@field textarea function

local fields = {
  text = require("fields.text"),
  email = require("fields.email"),
  password = require("fields.password"),
  number = require("fields.number"),
  textarea = require("fields.textarea")
}

return fields
