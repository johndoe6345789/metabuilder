local M = {}

function M.on_install(context)
  return { message = "Forum Forge installed", version = context.version }
end

function M.on_uninstall()
  return { message = "Forum Forge removed" }
end

return M
