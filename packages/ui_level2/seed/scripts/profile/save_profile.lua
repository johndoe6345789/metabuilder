-- Save profile form handler

---@class FormData
---@field email string

---@class ProfileResponse
---@field success boolean
---@field action string
---@field email string

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
