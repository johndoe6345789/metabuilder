--- Audit log filtering module
--- DEPRECATED: This file redirects to filters/init.lua
--- Individual functions are now in separate files under filters/
---
--- Migration guide:
---   Old: local filters = require("filters")
---   New: local filters = require("filters.init")
---   Or import individual functions:
---        local filterByOperation = require("filters.filter_by_operation")
---
--- Types are defined in filters/types.lua
---@module filters
---@deprecated Use filters.init instead

return require("filters.init")
