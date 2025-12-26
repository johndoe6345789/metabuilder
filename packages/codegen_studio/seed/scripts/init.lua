local M = {}

function M.on_install(context)
  return { message = "Codegen Studio installed", version = context.version }
end

function M.on_uninstall()
  return { message = "Codegen Studio removed" }
end

return M
