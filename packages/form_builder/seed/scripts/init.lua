local M = {}
function M.on_install(ctx) return { message = "Form Builder installed", version = ctx.version } end
return M
