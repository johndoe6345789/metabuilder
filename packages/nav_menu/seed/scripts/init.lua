local M = {}
function M.on_install(ctx) return { message = "Nav Menu installed", version = ctx.version } end
return M
