local M = {}

function M.on_install(ctx)
  return { message = "Login Page installed", version = ctx.version }
end

function M.on_uninstall()
  return { message = "Login Page removed" }
end

return M
