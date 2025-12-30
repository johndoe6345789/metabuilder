--- Audit log statistics module
--- DEPRECATED: This file redirects to stats/init.lua
--- Individual functions are now in separate files under stats/
---
--- Migration guide:
---   Old: local stats = require("stats")
---   New: local stats = require("stats.init")
---   Or import individual functions:
---        local calculateStats = require("stats.calculate_stats")
---
--- Types are defined in stats/types.lua
---@module stats
---@deprecated Use stats.init instead

return require("stats.init")
