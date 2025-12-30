--- Stream scenes sub-module
--- Provides camera, screen, and layout components
---@class StreamScenesSubModule
---@field camera fun(id: string, label: string, source: string): SceneCameraComponent
---@field screen fun(id: string, label: string): SceneScreenComponent
---@field layout fun(type: "single"|"pip"|"split", sources?: table[]): SceneLayoutComponent

local scenes = {
  camera = require("scenes.camera"),
  screen = require("scenes.screen"),
  layout = require("scenes.layout")
}

return scenes
