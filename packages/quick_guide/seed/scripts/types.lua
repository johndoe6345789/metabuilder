---@meta
-- Type definitions for quick_guide package

---@class Step
---@field id string Unique step identifier
---@field title string Step title
---@field description string Step description
---@field duration string Estimated duration
---@field mediaUrl? string Optional media URL

---@class StepValidationErrors
---@field title? string Title error message
---@field description? string Description error message

---@class StepValidationResult
---@field valid boolean Whether step is valid
---@field errors StepValidationErrors Validation errors

---@class AllStepsValidationResult
---@field valid boolean Whether all steps are valid
---@field errors table<string, StepValidationErrors> Errors by step ID

---@class MediaState
---@field thumbnailUrl string Thumbnail URL
---@field videoUrl string Video URL
---@field thumbnailValid boolean Whether thumbnail URL is valid
---@field videoValid boolean Whether video URL is valid
---@field thumbnailIsImage boolean Whether thumbnail is an image URL
---@field videoIsVideo boolean Whether video is a video URL

---@class MediaProps
---@field thumbnailUrl? string Initial thumbnail URL
---@field videoUrl? string Initial video URL

return {}
