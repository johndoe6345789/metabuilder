-- Comments module facade
-- Re-exports all comment functions for backward compatibility
-- Each function is defined in its own file following 1-function-per-file pattern

---@class Comments
local M = {}

-- Import all single-function modules
local render = require("comments.render")
local composer = require("comments.composer")
local list = require("comments.list")
local postComment = require("comments.post_comment")

-- Re-export all functions
M.render = render.render
M.composer = composer.composer
M.list = list.list
M.postComment = postComment.postComment

return M
