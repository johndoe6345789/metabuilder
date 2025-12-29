local M = {}

function M.on_install(ctx)
  return { message = "Home Page installed", version = ctx.version }
end

function M.on_uninstall()
  return { message = "Home Page removed" }
end

return M
