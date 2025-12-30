--- Stream Cast package entry point
--- Provides streaming and broadcasting components
---@class StreamCast
---@field name string Package name
---@field version string Package version
---@field player StreamPlayerModule Player module
---@field scenes StreamScenesModule Scenes module
---@field schedule StreamScheduleModule Schedule module
---@field init fun(): { name: string, version: string, loaded: boolean }

---@class StreamPlayerModule
---@field PLAYING PlayerState
---@field PAUSED PlayerState
---@field BUFFERING PlayerState
---@field OFFLINE PlayerState
---@field render fun(stream: Stream): VideoPlayerComponent
---@field render_controls fun(state: PlayerState): PlayerControlsComponent
---@field render_status fun(state: PlayerState, viewers: number): StatusBarComponent

---@class StreamScenesModule
---@field render_scene fun(scene: Scene): ScenePreviewComponent
---@field render_list fun(scenes: Scene[]): SceneListComponent
---@field switch fun(scene_id: string): SwitchSceneAction
---@field create fun(name: string, sources?: table[]): CreateSceneAction

---@class StreamScheduleModule
---@field render_item fun(stream: ScheduledStream): ScheduleItemComponent
---@field render_list fun(streams: ScheduledStream[]): ScheduleListComponent
---@field create fun(data: { title: string, start_time: string, duration?: number }): ScheduleStreamAction
---@field cancel fun(stream_id: string): CancelStreamAction

local M = {}

M.name = "stream_cast"
M.version = "1.0.0"

M.player = require("player")
M.scenes = require("scenes")
M.schedule = require("schedule")

--- Initialize the stream cast module
---@return { name: string, version: string, loaded: boolean }
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
