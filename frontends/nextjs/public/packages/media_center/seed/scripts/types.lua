-- LuaCATS type definitions for media_center package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Job Types
--------------------------------------------------------------------------------

---@alias JobType
---| "video_transcode"
---| "audio_transcode"
---| "document_convert"
---| "image_process"
---| "radio_ingest"
---| "tv_segment"
---| "custom"

---@alias JobStatus
---| "pending"
---| "queued"
---| "processing"
---| "completed"
---| "failed"
---| "cancelled"

---@alias JobPriority
---| "urgent"
---| "high"
---| "normal"
---| "low"
---| "background"

---@class MediaJob
---@field id string Job ID
---@field tenant_id string Tenant ID
---@field user_id string User ID
---@field type JobType Job type
---@field status JobStatus Job status
---@field priority JobPriority Job priority
---@field progress? JobProgress Progress info
---@field input_path string Input file path
---@field output_path? string Output file path
---@field error_message? string Error message if failed
---@field created_at string ISO timestamp
---@field started_at? string ISO timestamp
---@field completed_at? string ISO timestamp

---@class JobProgress
---@field percent number Progress 0-100
---@field stage string Current processing stage
---@field eta? string Estimated time remaining

---@class JobSubmitParams
---@field type JobType Job type
---@field input_path string Input file path
---@field output_path? string Output path
---@field priority? JobPriority Job priority
---@field options? table<string, any> Type-specific options

---@class JobFilter
---@field tenant_id? string Filter by tenant
---@field user_id? string Filter by user
---@field status? JobStatus Filter by status
---@field type? JobType Filter by type
---@field limit? number Max results
---@field offset? number Skip results

--------------------------------------------------------------------------------
-- Media Asset Types
--------------------------------------------------------------------------------

---@class MediaAsset
---@field id string Asset ID
---@field name string Asset name
---@field type "video"|"audio"|"image"|"document" Asset type
---@field size number File size in bytes
---@field duration? number Duration in seconds (audio/video)
---@field dimensions? Dimensions Width/height (image/video)
---@field format string File format/codec
---@field thumbnail_url? string Thumbnail URL
---@field url string Asset URL
---@field created_at string ISO timestamp

---@class Dimensions
---@field width number Width in pixels
---@field height number Height in pixels

--------------------------------------------------------------------------------
-- Radio/TV Types
--------------------------------------------------------------------------------

---@class RadioStation
---@field id string Station ID
---@field name string Station name
---@field genre string Station genre
---@field stream_url string Live stream URL
---@field logo_url? string Station logo
---@field is_live boolean Currently broadcasting

---@class TvChannel
---@field id string Channel ID
---@field name string Channel name
---@field number number Channel number
---@field logo_url? string Channel logo
---@field current_program? TvProgram Current program
---@field stream_url? string Live stream URL

---@class TvProgram
---@field id string Program ID
---@field title string Program title
---@field description? string Program description
---@field start_time string ISO timestamp
---@field end_time string ISO timestamp
---@field category string Program category

--------------------------------------------------------------------------------
-- Queue Statistics
--------------------------------------------------------------------------------

---@class QueueStats
---@field total_jobs number Total jobs
---@field pending number Pending jobs
---@field processing number Processing jobs
---@field completed number Completed jobs
---@field failed number Failed jobs
---@field avg_processing_time number Average time in seconds

--------------------------------------------------------------------------------
-- Media API Module
--------------------------------------------------------------------------------

---@class MediaApiModule
---@field configure fun(opts: table) Configure API client
---@field list_jobs fun(filters?: JobFilter): MediaJob[] List jobs
---@field get_job fun(job_id: string): MediaJob|nil Get job by ID
---@field submit_job fun(params: JobSubmitParams): string|nil, string? Submit new job
---@field cancel_job fun(job_id: string): boolean, string? Cancel job
---@field retry_job fun(job_id: string): string|nil, string? Retry failed job
---@field get_stats fun(): QueueStats Get queue statistics

---@class RadioHelpersModule
---@field list_stations fun(): RadioStation[] List radio stations
---@field get_station fun(id: string): RadioStation|nil Get station by ID
---@field get_now_playing fun(station_id: string): string Get current track

---@class TvHelpersModule
---@field list_channels fun(): TvChannel[] List TV channels
---@field get_channel fun(id: string): TvChannel|nil Get channel by ID
---@field get_schedule fun(channel_id: string, date?: string): TvProgram[] Get schedule

---@class DocumentHelpersModule
---@field convert fun(input: string, output_format: string): string|nil Convert document
---@field get_supported_formats fun(): string[] Get supported formats
---@field extract_text fun(path: string): string Extract text content

return {}
