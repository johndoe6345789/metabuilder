-- Transfer module facade
-- Re-exports all power transfer functions for backward compatibility

---@class TransferModule
---@field transfer_form fun(from_user: User, to_user: User): TransferFormComponent
---@field transfer_history fun(): TransferHistoryComponent
---@type TransferModule
local M = {}

M.transfer_form = require("transfer.transfer_form")
M.transfer_history = require("transfer.transfer_history")

return M
