--- Thread ranking facade for forum_forge
--- Re-exports single-function modules for backward compatibility
---@module thread_rank

---@class ThreadRankModule
---@field rank_thread fun(thread: Thread): number Calculate thread rank score
local M = {}

M.rank_thread = require("rank_thread")

return M
