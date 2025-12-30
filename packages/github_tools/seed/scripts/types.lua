-- GitHub Tools package types
---@meta

---@alias RunStatus "success" | "failure" | "pending" | "cancelled" | "skipped"
---@alias RunConclusion "success" | "failure" | "cancelled" | "skipped" | "timed_out" | "action_required"

---@class WorkflowRun
---@field id number Run ID
---@field name string Workflow name
---@field head_branch string Branch name
---@field head_sha string Commit SHA
---@field status RunStatus Run status
---@field conclusion? RunConclusion Run conclusion
---@field created_at string ISO timestamp
---@field updated_at string ISO timestamp
---@field run_number number Run number
---@field html_url string GitHub URL

---@class WorkflowJob
---@field id number Job ID
---@field name string Job name
---@field status RunStatus Job status
---@field conclusion? RunConclusion Job conclusion
---@field started_at? string ISO timestamp
---@field completed_at? string ISO timestamp
---@field steps JobStep[] Job steps

---@class JobStep
---@field name string Step name
---@field status RunStatus Step status
---@field conclusion? RunConclusion Step conclusion
---@field number number Step number

---@class RunFilters
---@field status? RunStatus Filter by status
---@field branch? string Filter by branch
---@field dateRange? string Time range (1d, 7d, 30d)

---@class RunStats
---@field total number Total runs
---@field success number Successful runs
---@field failure number Failed runs
---@field pending number Pending runs
---@field success_rate number Success percentage
---@field avg_duration number Average duration in seconds

---@class GitHubConfig
---@field owner string Repository owner
---@field repo string Repository name
---@field token? string GitHub token
---@field workflow? string Workflow file name

return {}
