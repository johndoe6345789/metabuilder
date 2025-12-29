local M = {}
function M.on_install(ctx) return { message = "Level 2 installed", version = ctx.version } end
return M
