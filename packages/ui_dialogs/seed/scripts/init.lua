local M = {}
function M.on_install(ctx) return { message = "UI Dialogs installed", version = ctx.version } end
return M
