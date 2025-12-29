local validate = require("validate")
local M = {}

function M.handleLogin(form)
  local result = validate.login(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return { success = true, action = "login", username = form.username }
end

function M.handleRegister(form)
  local result = validate.register(form)
  if not result.valid then
    return { success = false, errors = result.errors }
  end
  return { success = true, action = "register", username = form.username, email = form.email }
end

return M
