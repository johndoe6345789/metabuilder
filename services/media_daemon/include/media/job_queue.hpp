#pragma once

#include "media/types.hpp"
#include "media/plugin_manager.hpp"
#include <memory>
#include <queue>
#include <vector>
#include <map>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <atomic>
#include <functional>

namespace media {

/**
 * Job Queue Configuration
 */
struct JobQueueConfig {
    // Worker counts per job type
    int video_workers = 2;
    int audio_workers = 4;
    int document_workers = 4;
    int image_workers = 8;
    
    // Directories
    std::string temp_dir = "/data/temp";
    std::string output_dir = "/data/output";
    
    // Retention (hours)
    int completed_retention_hours = 24;
    int failed_retention_hours = 168;
    
    // Notification callback
    NotificationCallback notification_callback;
};

/**
 * Job Queue
 * 
 * Thread-safe priority queue for processing media jobs.
 * Supports multiple worker threads per job type.
 */
class JobQueue {
public:
    JobQueue();
    ~JobQueue();
    
    // Disable copying
    JobQueue(const JobQueue&) = delete;
    JobQueue& operator=(const JobQueue&) = delete;
    
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /**
     * Initialize the job queue
     * @param config Queue configuration
     * @param plugin_manager Plugin manager for job processing
     * @return Result indicating success or failure
     */
    Result<void> initialize(
        const JobQueueConfig& config,
        PluginManager* plugin_manager
    );
    
    /**
     * Start processing jobs
     */
    void start();
    
    /**
     * Stop processing and shutdown
     * @param wait_for_completion Wait for current jobs to finish
     */
    void stop(bool wait_for_completion = true);
    
    // ========================================================================
    // Job Management
    // ========================================================================
    
    /**
     * Submit a new job
     * @param request Job request
     * @return Result with job ID or error
     */
    Result<std::string> submit(const JobRequest& request);
    
    /**
     * Get job status
     * @param job_id Job ID
     * @return Result with job info or error
     */
    Result<JobInfo> get_job(const std::string& job_id) const;
    
    /**
     * List jobs with optional filtering
     * @param tenant_id Filter by tenant (empty for all)
     * @param user_id Filter by user (empty for all)
     * @param status Filter by status (optional)
     * @param limit Maximum results
     * @param offset Pagination offset
     * @return Vector of job info
     */
    std::vector<JobInfo> list_jobs(
        const std::string& tenant_id = "",
        const std::string& user_id = "",
        std::optional<JobStatus> status = std::nullopt,
        size_t limit = 100,
        size_t offset = 0
    ) const;
    
    /**
     * Cancel a job
     * @param job_id Job ID
     * @return Result indicating success or failure
     */
    Result<void> cancel(const std::string& job_id);
    
    /**
     * Retry a failed job
     * @param job_id Job ID
     * @return Result with new job ID or error
     */
    Result<std::string> retry(const std::string& job_id);
    
    // ========================================================================
    // Callbacks
    // ========================================================================
    
    /**
     * Set progress callback
     */
    void set_progress_callback(JobProgressCallback callback);
    
    /**
     * Set completion callback
     */
    void set_completion_callback(JobCompletionCallback callback);
    
    // ========================================================================
    // Statistics
    // ========================================================================
    
    /**
     * Get queue statistics
     */
    struct QueueStats {
        size_t pending_jobs = 0;
        size_t processing_jobs = 0;
        size_t completed_jobs = 0;
        size_t failed_jobs = 0;
        size_t cancelled_jobs = 0;
        
        // Per-type counts
        std::map<JobType, size_t> pending_by_type;
        std::map<JobType, size_t> processing_by_type;
        
        // Worker status
        int total_workers = 0;
        int busy_workers = 0;
        int idle_workers = 0;
    };
    
    QueueStats get_stats() const;
    
    /**
     * Check if queue is running
     */
    bool is_running() const { return running_.load(); }
    
private:
    /**
     * Generate unique job ID
     */
    std::string generate_job_id();
    
    /**
     * Worker thread function
     */
    void worker_thread(JobType type, int worker_id);
    
    /**
     * Process a single job
     */
    void process_job(JobInfo& job);
    
    /**
     * Update job status
     */
    void update_job_status(const std::string& job_id, JobStatus status, const std::string& error = "");
    
    /**
     * Send notification via DBAL
     */
    void send_notification(const JobInfo& job, NotificationType type);
    
    /**
     * Cleanup old jobs
     */
    void cleanup_old_jobs();
    
    /**
     * Cleanup thread function
     */
    void cleanup_thread();
    
    // Configuration
    JobQueueConfig config_;
    PluginManager* plugin_manager_ = nullptr;
    
    // State
    std::atomic<bool> initialized_{false};
    std::atomic<bool> running_{false};
    
    // Job storage
    mutable std::mutex jobs_mutex_;
    std::map<std::string, JobInfo> jobs_;
    std::map<std::string, JobRequest> job_requests_;  // Original requests
    
    // Priority queues per job type
    struct JobQueueEntry {
        std::string job_id;
        JobPriority priority;
        std::chrono::system_clock::time_point submitted_at;
        
        bool operator<(const JobQueueEntry& other) const {
            // Lower priority value = higher priority
            if (static_cast<int>(priority) != static_cast<int>(other.priority)) {
                return static_cast<int>(priority) > static_cast<int>(other.priority);
            }
            // Earlier submission time = higher priority
            return submitted_at > other.submitted_at;
        }
    };
    
    mutable std::mutex queues_mutex_;
    std::map<JobType, std::priority_queue<JobQueueEntry>> queues_;
    std::map<JobType, std::condition_variable> queue_cvs_;
    
    // Worker threads
    std::vector<std::thread> workers_;
    std::map<JobType, std::vector<std::thread>> typed_workers_;
    
    // Cleanup thread
    std::thread cleanup_thread_;
    std::condition_variable cleanup_cv_;
    
    // Callbacks
    JobProgressCallback progress_callback_;
    JobCompletionCallback completion_callback_;
    
    // Job ID counter
    std::atomic<uint64_t> job_counter_{0};
};

} // namespace media
