local M = {}

function M.on_install(ctx)
  return { message = "Intro Section installed", version = ctx.version }
end

return M
