local M = {}

function M.on_install(context)
  return { message = "Arcade Lobby installed", version = context.version }
end

function M.on_uninstall()
  return { message = "Arcade Lobby removed" }
end

return M
