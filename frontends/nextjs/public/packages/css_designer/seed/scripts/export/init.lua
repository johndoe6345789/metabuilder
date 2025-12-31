-- Export functions facade
-- Re-exports all export-related functions

local toScss = require("export.to_scss")
local toCss = require("export.to_css")

---@class ExportModule
local M = {}

-- Re-export SCSS functions
M.to_scss = toScss.to_scss
M.generate_scss_variables = toScss.generate_scss_variables

-- Re-export CSS functions
M.to_css = toCss.to_css
M.generate_css_variables = toCss.generate_css_variables

return M
