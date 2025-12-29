local M = {}
function M.on_install(ctx) return { message = "Dashboard installed", version = ctx.version } end
return M
