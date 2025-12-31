-- GitHub Tools package types
-- Provides types for GitHub API integration, workflow runs, and CI/CD analytics
---@meta

--------------------------------------------------------------------------------
-- Enums and Aliases
--------------------------------------------------------------------------------

---@alias RunStatus
---| "queued" Workflow is queued
---| "in_progress" Workflow is running
---| "completed" Workflow finished
---| "waiting" Waiting for approval
---| "requested" Run was requested
---| "pending" Run is pending

---@alias RunConclusion
---| "success" Run succeeded
---| "failure" Run failed
---| "cancelled" Run was cancelled
---| "skipped" Run was skipped
---| "timed_out" Run exceeded time limit
---| "action_required" Manual action needed
---| "stale" Run became stale
---| "neutral" Run completed with neutral status
---| "startup_failure" Failed during startup

---@alias JobStatus "queued" | "in_progress" | "completed" | "waiting"

---@alias DateRange
---| "1h" Last hour
---| "6h" Last 6 hours
---| "24h" Last 24 hours
---| "7d" Last 7 days
---| "30d" Last 30 days
---| "90d" Last 90 days

--------------------------------------------------------------------------------
-- Core Data Types
--------------------------------------------------------------------------------

---@class WorkflowRun
---@field id number Unique run ID
---@field name string Workflow name
---@field head_branch string Branch that triggered the run
---@field head_sha string Full commit SHA
---@field status RunStatus Current run status
---@field conclusion? RunConclusion Final conclusion (when completed)
---@field created_at string ISO timestamp of creation
---@field updated_at string ISO timestamp of last update
---@field run_started_at? string ISO timestamp when run actually started
---@field run_number number Sequential run number for this workflow
---@field run_attempt number Attempt number (for re-runs)
---@field html_url string GitHub web UI URL
---@field jobs_url string API URL to fetch jobs
---@field logs_url string API URL to fetch logs
---@field workflow_id number Parent workflow definition ID
---@field event string Trigger event (push, pull_request, etc.)
---@field actor Actor User who triggered the run
---@field triggering_actor? Actor User who triggered re-run (if different)
---@field repository Repository Repository information

---@class Actor
---@field login string GitHub username
---@field id number User ID
---@field avatar_url string Avatar image URL
---@field type "User"|"Bot"|"Organization" Account type

---@class Repository
---@field id number Repository ID
---@field name string Repository name (without owner)
---@field full_name string Full repository name (owner/repo)
---@field owner Actor Repository owner
---@field html_url string Repository web URL
---@field private boolean Whether repository is private

---@class WorkflowJob
---@field id number Unique job ID
---@field run_id number Parent run ID
---@field name string Job name
---@field status JobStatus Job status
---@field conclusion? RunConclusion Job conclusion (when completed)
---@field started_at? string ISO timestamp when job started
---@field completed_at? string ISO timestamp when job completed
---@field steps JobStep[] Job steps
---@field runner_id? number Runner ID that executed job
---@field runner_name? string Runner name
---@field runner_group_id? number Runner group ID
---@field runner_group_name? string Runner group name
---@field workflow_name string Parent workflow name
---@field head_sha string Commit SHA
---@field labels string[] Runner labels

---@class JobStep
---@field name string Step name
---@field status JobStatus Step status
---@field conclusion? RunConclusion Step conclusion
---@field number number Step number (1-indexed)
---@field started_at? string ISO timestamp when step started
---@field completed_at? string ISO timestamp when step completed

--------------------------------------------------------------------------------
-- Filter and Request Types
--------------------------------------------------------------------------------

---@class RunFilters
---@field status? RunStatus Filter by status
---@field conclusion? RunConclusion Filter by conclusion
---@field branch? string Filter by branch name
---@field event? string Filter by trigger event
---@field actor? string Filter by actor username
---@field dateRange? DateRange Time range filter
---@field created_after? string Filter runs after ISO date
---@field created_before? string Filter runs before ISO date

---@class RunPagination
---@field page number Page number (1-indexed)
---@field per_page number Items per page (max 100)

---@class GitHubConfig
---@field owner string Repository owner (user or org)
---@field repo string Repository name
---@field token? string GitHub personal access token
---@field workflow? string Workflow file name (e.g., "ci.yml")
---@field api_base_url? string API base URL (for GitHub Enterprise)

---@class ApiRequestConfig
---@field timeout? number Request timeout in milliseconds
---@field retries? number Number of retries on failure
---@field retry_delay? number Delay between retries in ms

--------------------------------------------------------------------------------
-- Response Types
--------------------------------------------------------------------------------

---@class PaginatedRuns
---@field runs WorkflowRun[] Workflow runs for current page
---@field total_count number Total matching runs
---@field page number Current page number
---@field per_page number Items per page
---@field has_more boolean Whether more pages exist

---@class RunStats
---@field total number Total runs analyzed
---@field success number Successful runs
---@field failure number Failed runs
---@field cancelled number Cancelled runs
---@field pending number Pending/in-progress runs
---@field success_rate number Success percentage (0-100)
---@field avg_duration number Average duration in seconds
---@field median_duration number Median duration in seconds
---@field p95_duration number 95th percentile duration

---@class RunTimeSeries
---@field date string ISO date (YYYY-MM-DD)
---@field total number Total runs that day
---@field success number Successful runs
---@field failure number Failed runs
---@field avg_duration number Average duration

---@class FailureAnalysis
---@field total_failures number Total failed runs
---@field common_errors FailurePattern[] Most common failure patterns
---@field flaky_tests FlakyTest[] Tests that fail intermittently
---@field failure_by_step StepFailure[] Failures grouped by step

---@class FailurePattern
---@field pattern string Error pattern/message
---@field count number Occurrences
---@field percentage number Percentage of failures
---@field example_run_id number Example run ID

---@class FlakyTest
---@field name string Test name
---@field pass_rate number Pass rate percentage
---@field occurrences number Total runs
---@field recent_failures number Failures in last 7 days

---@class StepFailure
---@field step_name string Step name
---@field count number Failure count
---@field percentage number Percentage of total failures

---@class RateLimitInfo
---@field limit number Max requests per hour
---@field remaining number Remaining requests
---@field reset number Unix timestamp when limit resets
---@field used number Requests used in current window

--------------------------------------------------------------------------------
-- Log Types
--------------------------------------------------------------------------------

---@class LogEntry
---@field timestamp string ISO timestamp
---@field level "debug"|"info"|"warning"|"error" Log level
---@field message string Log message
---@field step? string Step name (if from a step)
---@field line_number number Line number in raw log

---@class ParsedLogs
---@field entries LogEntry[] Parsed log entries
---@field raw string Raw log content
---@field job_id number Job ID
---@field job_name string Job name
---@field errors LogEntry[] Only error entries
---@field warnings LogEntry[] Only warning entries

--------------------------------------------------------------------------------
-- Action Types
--------------------------------------------------------------------------------

---@class TriggerWorkflowInput
---@field ref string Branch or tag to run on
---@field inputs? table<string, string> Workflow dispatch inputs

---@class CancelRunResult
---@field success boolean Whether cancellation succeeded
---@field run_id number Run ID that was cancelled
---@field error? string Error message if failed

---@class RerunConfig
---@field run_id number Run ID to re-run
---@field failed_only? boolean Only re-run failed jobs

--------------------------------------------------------------------------------
-- Module Interface
--------------------------------------------------------------------------------

---@class GitHubToolsModule
---@field configure fun(config: GitHubConfig): GitHubToolsModule Configure with credentials
---@field list_runs fun(filters?: RunFilters, pagination?: RunPagination): PaginatedRuns List workflow runs
---@field get_run fun(run_id: number): WorkflowRun Get run details
---@field get_jobs fun(run_id: number): WorkflowJob[] Get jobs for a run
---@field get_job fun(job_id: number): WorkflowJob Get single job details
---@field get_logs fun(job_id: number): ParsedLogs Get and parse job logs
---@field get_raw_logs fun(job_id: number): string Get raw log content
---@field get_stats fun(filters?: RunFilters, date_range?: DateRange): RunStats Calculate run statistics
---@field get_time_series fun(filters?: RunFilters, date_range?: DateRange): RunTimeSeries[] Get time series data
---@field analyze_failures fun(filters?: RunFilters, date_range?: DateRange): FailureAnalysis Analyze failure patterns
---@field trigger_workflow fun(workflow_id: string, input: TriggerWorkflowInput): WorkflowRun Trigger a workflow run
---@field cancel_run fun(run_id: number): CancelRunResult Cancel a running workflow
---@field rerun fun(config: RerunConfig): WorkflowRun Re-run a workflow
---@field get_rate_limit fun(): RateLimitInfo Get current API rate limit status
---@field build_dashboard fun(config?: DashboardConfig): DashboardComponent Build dashboard UI config

---@class DashboardConfig
---@field show_stats? boolean Show statistics section
---@field show_recent_runs? boolean Show recent runs list
---@field show_failures? boolean Show failure analysis
---@field max_runs? number Maximum runs to display

---@class DashboardComponent
---@field type "Card" Component type
---@field props table Component properties
---@field children table[] Child components

return {}
