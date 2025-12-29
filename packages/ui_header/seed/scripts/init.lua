local M = {}

function M.on_install(ctx)
  return { message = "App Header installed", version = ctx.version }
end

return M
