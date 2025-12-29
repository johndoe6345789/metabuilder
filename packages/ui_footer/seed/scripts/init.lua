local M = {}

function M.on_install(ctx)
  return { message = "App Footer installed", version = ctx.version }
end

return M
