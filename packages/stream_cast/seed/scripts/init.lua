local M = {}

function M.on_install(context)
  return { message = "Stream Cast installed", version = context.version }
end

function M.on_uninstall()
  return { message = "Stream Cast removed" }
end

return M
