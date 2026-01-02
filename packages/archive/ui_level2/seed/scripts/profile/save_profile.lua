-- Save profile form handler

require("profile.types")

local M = {}

---Processes profile form submission and returns response
---@param form FormData
---@return ProfileResponse
function M.saveProfile(form)
  return {
    success = true,
    action = "update_profile",
    email = form.email
  }
end

return M
