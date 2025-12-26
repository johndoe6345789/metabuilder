local M = {}

function M.on_install(context)
  return { message = "Social Hub installed", version = context.version }
end

function M.on_uninstall()
  return { message = "Social Hub removed" }
end

return M
