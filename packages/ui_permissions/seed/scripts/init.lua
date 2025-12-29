local M = {}

function M.on_install(ctx)
  return { message = "UI Permissions installed", version = ctx.version }
end

function M.on_uninstall()
  return { message = "UI Permissions removed" }
end

return M
