---@alias JobType "video_transcode" | "audio_transcode" | "document_convert" | "image_process" | "radio_ingest" | "tv_segment" | "custom"
---@alias JobStatus "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled"
---@alias JobPriority "urgent" | "high" | "normal" | "low" | "background"

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
---@field percent number 0-100
---@field stage string Current stage
---@field eta? string Estimated time remaining

---@class MediaApiModule
---@field list_jobs fun(filters?: table): MediaJob[] List jobs with optional filters
---@field get_job fun(job_id: string): MediaJob|nil Get job by ID
---@field submit_job fun(params: table): string|nil, string? Submit a new job
---@field cancel_job fun(job_id: string): boolean, string? Cancel a job
---@field retry_job fun(job_id: string): string|nil, string? Retry a failed job
---@field get_stats fun(): table Get queue statistics
local M = {}

-- Configuration
local config = {
  base_url = "http://localhost:8090",
  timeout_ms = 30000
}

---Configure the API client
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
  if opts.timeout_ms then config.timeout_ms = opts.timeout_ms end
end

---List jobs with optional filtering
---@param filters? table Filter options (tenant_id, user_id, status, type, limit, offset)
---@return MediaJob[] jobs List of jobs
function M.list_jobs(filters)
  filters = filters or {}
  
  local query_params = {}
  if filters.tenant_id then table.insert(query_params, "tenant_id=" .. filters.tenant_id) end
  if filters.user_id then table.insert(query_params, "user_id=" .. filters.user_id) end
  if filters.status then table.insert(query_params, "status=" .. filters.status) end
  if filters.type then table.insert(query_params, "type=" .. filters.type) end
  if filters.limit then table.insert(query_params, "limit=" .. tostring(filters.limit)) end
  if filters.offset then table.insert(query_params, "offset=" .. tostring(filters.offset)) end
  
  local url = config.base_url .. "/api/jobs"
  if #query_params > 0 then
    url = url .. "?" .. table.concat(query_params, "&")
  end
  
  -- HTTP request would go here
  -- For now, return mock data
  return {}
end

---Get a job by ID
---@param job_id string Job ID
---@return MediaJob|nil job Job info or nil if not found
function M.get_job(job_id)
  if not job_id or job_id == "" then
    return nil
  end
  
  local url = config.base_url .. "/api/jobs/" .. job_id
  -- HTTP request would go here
  return nil
end

---Submit a new job
---@param params table Job parameters
---@return string|nil job_id Job ID if successful
---@return string? error Error message if failed
function M.submit_job(params)
  if not params.type then
    return nil, "Job type is required"
  end
  
  if not params.input_path then
    return nil, "Input path is required"
  end
  
  local valid_types = {
    video_transcode = true,
    audio_transcode = true,
    document_convert = true,
    image_process = true,
    custom = true
  }
  
  if not valid_types[params.type] then
    return nil, "Invalid job type: " .. tostring(params.type)
  end
  
  -- HTTP POST would go here
  return nil, "Not implemented"
end

---Cancel a job
---@param job_id string Job ID
---@return boolean success Whether cancellation was successful
---@return string? error Error message if failed
function M.cancel_job(job_id)
  if not job_id or job_id == "" then
    return false, "Job ID is required"
  end
  
  -- HTTP DELETE would go here
  return false, "Not implemented"
end

---Retry a failed job
---@param job_id string Job ID
---@return string|nil new_job_id New job ID if successful
---@return string? error Error message if failed
function M.retry_job(job_id)
  if not job_id or job_id == "" then
    return nil, "Job ID is required"
  end
  
  -- HTTP POST would go here
  return nil, "Not implemented"
end

---Get queue statistics
---@return table stats Queue statistics
function M.get_stats()
  -- HTTP GET would go here
  return {
    pending_jobs = 0,
    processing_jobs = 0,
    completed_jobs = 0,
    failed_jobs = 0,
    total_workers = 0,
    busy_workers = 0,
    queue_utilization = 0
  }
end

---Get job type display name
---@param job_type JobType Job type
---@return string name Display name
function M.get_type_display_name(job_type)
  local names = {
    video_transcode = "Video Transcode",
    audio_transcode = "Audio Transcode",
    document_convert = "Document Convert",
    image_process = "Image Process",
    radio_ingest = "Radio Ingest",
    tv_segment = "TV Segment",
    custom = "Custom"
  }
  return names[job_type] or job_type
end

---Get status color for UI
---@param status JobStatus Job status
---@return string color MUI color name
function M.get_status_color(status)
  local colors = {
    pending = "default",
    queued = "info",
    processing = "warning",
    completed = "success",
    failed = "error",
    cancelled = "default"
  }
  return colors[status] or "default"
end

return M
