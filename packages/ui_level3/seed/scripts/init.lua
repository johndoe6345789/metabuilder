local M = {}
function M.on_install(ctx) return { message = "Level 3 installed", version = ctx.version } end
return M
