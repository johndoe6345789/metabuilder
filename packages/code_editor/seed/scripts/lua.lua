-- Lua Editor utilities
local M = {}

function M.render(value, options)
  return {
    type = "code_editor",
    props = {
      language = "lua",
      value = value or "",
      read_only = options and options.read_only or false,
      line_numbers = true,
      show_snippets = true
    }
  }
end

function M.validate(lua_code)
  -- Lua syntax validation placeholder
  return {
    valid = true,
    errors = {}
  }
end

function M.run_sandbox(lua_code, context)
  return {
    action = "execute",
    sandbox = true,
    context = context or {}
  }
end

return M
