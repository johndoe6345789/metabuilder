-- Validation module for SMTP config
local smtp = require("smtp")

---@class ValidateModule
local M = {}

-- Export validation function
M.validate = smtp.validate

return M
