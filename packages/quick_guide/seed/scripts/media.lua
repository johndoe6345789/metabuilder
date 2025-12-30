--- Media pane logic facade for quick guides
--- Re-exports media functions for backward compatibility
---@module media

local is_valid_url = require("is_valid_url")
local is_image_url = require("is_image_url")
local is_video_url = require("is_video_url")
local prepare_media_state = require("prepare_media_state")
local handle_thumbnail_change = require("handle_thumbnail_change")
local handle_video_change = require("handle_video_change")

---@class MediaModule
local M = {}

M.isValidUrl = is_valid_url
M.isImageUrl = is_image_url
M.isVideoUrl = is_video_url
M.prepareMediaState = prepare_media_state
M.handleThumbnailChange = handle_thumbnail_change
M.handleVideoChange = handle_video_change

return M
