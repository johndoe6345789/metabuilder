---@meta
-- Type definitions for stream_cast package

---@alias PlayerState "playing" | "paused" | "buffering" | "offline"

---@class Stream
---@field id string Stream ID
---@field url string Stream URL
---@field thumbnail? string Thumbnail URL
---@field title? string Stream title
---@field start_time? string Start time
---@field duration? number Duration in minutes

---@class VideoPlayerComponent
---@field type "video_player"
---@field props VideoPlayerProps

---@class VideoPlayerProps
---@field src string Source URL
---@field poster? string Poster image URL
---@field autoplay boolean Auto-play enabled
---@field controls boolean Show controls

---@class PlayerControlsComponent
---@field type "player_controls"
---@field children table[] Control components

---@class StatusBarComponent
---@field type "status_bar"
---@field children table[] Status components

---@class Scene
---@field id string Scene ID
---@field name string Scene name
---@field thumbnail? string Scene thumbnail
---@field active? boolean Whether scene is active

---@class ScenePreviewComponent
---@field type "scene_preview"
---@field props ScenePreviewProps

---@class ScenePreviewProps
---@field id string Scene ID
---@field name string Scene name
---@field thumbnail? string Thumbnail URL
---@field active boolean Is active

---@class SceneListComponent
---@field type "scene_list"
---@field children ScenePreviewComponent[]

---@class SwitchSceneAction
---@field action "switch_scene"
---@field scene_id string Scene ID to switch to

---@class CreateSceneAction
---@field action "create_scene"
---@field data CreateSceneData

---@class CreateSceneData
---@field name string Scene name
---@field sources table[] Scene sources

---@class ScheduledStream
---@field id? string Stream ID
---@field title string Stream title
---@field start_time string Start time
---@field duration number Duration in minutes
---@field thumbnail? string Thumbnail URL

---@class ScheduleItemComponent
---@field type "schedule_item"
---@field props ScheduleItemProps

---@class ScheduleItemProps
---@field title string Stream title
---@field start_time string Start time
---@field duration number Duration
---@field thumbnail? string Thumbnail URL

---@class ScheduleListComponent
---@field type "schedule_list"
---@field children ScheduleItemComponent[]

---@class ScheduleStreamAction
---@field action "schedule_stream"
---@field data ScheduleStreamData

---@class ScheduleStreamData
---@field title string Stream title
---@field start_time string Start time
---@field duration number Duration in minutes

---@class CancelStreamAction
---@field action "cancel_stream"
---@field stream_id string Stream ID to cancel

---@class PlayerControlsConfig
---@field type "player_controls"
---@field showPlay boolean
---@field showVolume boolean
---@field showFullscreen boolean

---@class PlayerOverlayComponent
---@field type "player_overlay"
---@field title string
---@field subtitle string

---@class SceneCameraComponent
---@field type "scene_camera"
---@field id string
---@field label string
---@field source string

---@class SceneLayoutComponent
---@field type "scene_layout"
---@field layoutType "single" | "pip" | "split"
---@field sources table[]

---@class SceneScreenComponent
---@field type "scene_screen"
---@field id string
---@field label string

return {}
