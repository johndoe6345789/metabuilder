-- Transfer module facade
-- Re-exports all power transfer functions for backward compatibility

local M = {}

M.transfer_form = require("transfer.transfer_form")
M.transfer_history = require("transfer.transfer_history")

return M
