local M = {}

function M.on_install(context)
  return { message = "IRC Webchat installed", version = context.version }
end

function M.on_uninstall()
  return { message = "IRC Webchat removed" }
end

return M
