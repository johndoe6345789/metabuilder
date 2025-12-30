-- Audit log formatting module
-- DEPRECATED: This file redirects to formatting/init.lua
-- Individual functions are now in separate files under formatting/
--
-- Migration guide:
--   Old: local formatting = require("formatting")
--   New: local formatting = require("formatting.init")
--   Or import individual functions:
--        local formatTimestamp = require("formatting.format_timestamp")
--
-- Types are defined in formatting/types.lua

return require("formatting.init")
