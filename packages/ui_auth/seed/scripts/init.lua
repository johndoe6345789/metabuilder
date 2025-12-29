local M = {}
function M.on_install(ctx) return { message = "Auth UI installed", version = ctx.version } end
return M
