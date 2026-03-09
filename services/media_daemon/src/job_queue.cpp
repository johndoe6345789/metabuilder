#include "media/job_queue.hpp"
#include "media/plugin_manager.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <algorithm>
#include <cassert>
#include <filesystem>

namespace media {

JobQueue::JobQueue() = default;

JobQueue::~JobQueue() {
    stop(false);
}

// ============================================================================
// Initialization
// ============================================================================

Result<void> JobQueue::initialize(
    const JobQueueConfig& config,
    PluginManager* plugin_manager
) {
    if (initialized_.load()) {
        return Result<void>::ok();
    }

    config_ = config;
    plugin_manager_ = plugin_manager;

    if (!plugin_manager_) {
        return Result<void>::error(
            ErrorCode::VALIDATION_ERROR,
            "PluginManager is required"
        );
    }

    // Create directories
    std::filesystem::create_directories(config_.temp_dir);
    std::filesystem::create_directories(config_.output_dir);

    initialized_.store(true);
    std::cout << "[JobQueue] Initialized" << std::endl;
    return Result<void>::ok();
}

void JobQueue::start() {
    if (running_.load()) return;
    running_.store(true);

    // Video workers
    for (int i = 0; i < config_.video_workers; ++i) {
        typed_workers_[JobType::VIDEO_TRANSCODE].emplace_back(
            [this, i]() { worker_thread(JobType::VIDEO_TRANSCODE, i); }
        );
    }

    // Audio workers
    for (int i = 0; i < config_.audio_workers; ++i) {
        typed_workers_[JobType::AUDIO_TRANSCODE].emplace_back(
            [this, i]() { worker_thread(JobType::AUDIO_TRANSCODE, i); }
        );
    }

    // Document workers
    for (int i = 0; i < config_.document_workers; ++i) {
        typed_workers_[JobType::DOCUMENT_CONVERT].emplace_back(
            [this, i]() { worker_thread(JobType::DOCUMENT_CONVERT, i); }
        );
    }

    // Image workers
    for (int i = 0; i < config_.image_workers; ++i) {
        typed_workers_[JobType::IMAGE_PROCESS].emplace_back(
            [this, i]() { worker_thread(JobType::IMAGE_PROCESS, i); }
        );
    }

    // Generic / custom workers (2)
    for (int i = 0; i < 2; ++i) {
        typed_workers_[JobType::CUSTOM].emplace_back(
            [this, i]() { worker_thread(JobType::CUSTOM, i); }
        );
    }

    // Cleanup thread
    cleanup_thread_ = std::thread([this]() { cleanup_thread(); });

    std::cout << "[JobQueue] Started workers" << std::endl;
}

void JobQueue::stop(bool wait_for_completion) {
    if (!running_.load()) return;
    running_.store(false);

    // Notify all worker CVs
    {
        std::lock_guard<std::mutex> lock(queues_mutex_);
        for (auto& [type, cv] : queue_cvs_) {
            cv.notify_all();
        }
    }

    cleanup_cv_.notify_all();

    // Join typed workers
    for (auto& [type, threads] : typed_workers_) {
        for (auto& t : threads) {
            if (t.joinable()) t.join();
        }
    }
    typed_workers_.clear();

    // Join general workers
    for (auto& t : workers_) {
        if (t.joinable()) t.join();
    }
    workers_.clear();

    if (cleanup_thread_.joinable()) cleanup_thread_.join();

    std::cout << "[JobQueue] Stopped" << std::endl;
}

// ============================================================================
// Job Management
// ============================================================================

Result<std::string> JobQueue::submit(const JobRequest& request) {
    if (!initialized_.load()) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "JobQueue not initialized"
        );
    }

    JobRequest req = request;
    if (req.id.empty()) {
        req.id = generate_job_id();
    }

    JobInfo info;
    info.id = req.id;
    info.tenant_id = req.tenant_id;
    info.user_id = req.user_id;
    info.type = req.type;
    info.status = JobStatus::PENDING;
    info.priority = req.priority;
    info.created_at = std::chrono::system_clock::now();
    info.metadata = req.metadata;

    {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        jobs_[req.id] = info;
        job_requests_[req.id] = req;
    }

    // Enqueue
    JobQueueEntry entry;
    entry.job_id = req.id;
    entry.priority = req.priority;
    entry.submitted_at = std::chrono::system_clock::now();

    {
        std::lock_guard<std::mutex> lock(queues_mutex_);
        queues_[req.type].push(entry);
        auto it = queue_cvs_.find(req.type);
        if (it != queue_cvs_.end()) {
            it->second.notify_one();
        }
    }

    update_job_status(req.id, JobStatus::QUEUED);
    std::cout << "[JobQueue] Submitted job " << req.id << std::endl;
    return Result<std::string>::ok(req.id);
}

Result<JobInfo> JobQueue::get_job(const std::string& job_id) const {
    std::lock_guard<std::mutex> lock(jobs_mutex_);
    auto it = jobs_.find(job_id);
    if (it == jobs_.end()) {
        return Result<JobInfo>::error(ErrorCode::NOT_FOUND, "Job not found: " + job_id);
    }
    return Result<JobInfo>::ok(it->second);
}

std::vector<JobInfo> JobQueue::list_jobs(
    const std::string& tenant_id,
    const std::string& user_id,
    std::optional<JobStatus> status,
    size_t limit,
    size_t offset
) const {
    std::lock_guard<std::mutex> lock(jobs_mutex_);

    std::vector<JobInfo> result;
    size_t skipped = 0;

    for (const auto& [id, info] : jobs_) {
        if (!tenant_id.empty() && info.tenant_id != tenant_id) continue;
        if (!user_id.empty() && info.user_id != user_id) continue;
        if (status.has_value() && info.status != *status) continue;

        if (skipped < offset) {
            ++skipped;
            continue;
        }

        result.push_back(info);
        if (result.size() >= limit) break;
    }

    return result;
}

Result<void> JobQueue::cancel(const std::string& job_id) {
    {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = jobs_.find(job_id);
        if (it == jobs_.end()) {
            return Result<void>::error(ErrorCode::NOT_FOUND, "Job not found: " + job_id);
        }

        if (it->second.status == JobStatus::COMPLETED
            || it->second.status == JobStatus::FAILED
            || it->second.status == JobStatus::CANCELLED) {
            return Result<void>::error(
                ErrorCode::CONFLICT,
                "Job already in terminal state"
            );
        }
    }

    update_job_status(job_id, JobStatus::CANCELLED);
    return Result<void>::ok();
}

Result<std::string> JobQueue::retry(const std::string& job_id) {
    JobRequest original;

    {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = job_requests_.find(job_id);
        if (it == job_requests_.end()) {
            return Result<std::string>::error(ErrorCode::NOT_FOUND, "Job not found: " + job_id);
        }
        original = it->second;
    }

    original.id = "";  // Generate new ID
    return submit(original);
}

// ============================================================================
// Callbacks
// ============================================================================

void JobQueue::set_progress_callback(JobProgressCallback callback) {
    progress_callback_ = std::move(callback);
}

void JobQueue::set_completion_callback(JobCompletionCallback callback) {
    completion_callback_ = std::move(callback);
}

// ============================================================================
// Statistics
// ============================================================================

JobQueue::QueueStats JobQueue::get_stats() const {
    std::lock_guard<std::mutex> jlock(jobs_mutex_);

    QueueStats stats;

    for (const auto& [id, info] : jobs_) {
        switch (info.status) {
            case JobStatus::PENDING:
            case JobStatus::QUEUED:
                ++stats.pending_jobs;
                ++stats.pending_by_type[info.type];
                break;
            case JobStatus::PROCESSING:
                ++stats.processing_jobs;
                ++stats.processing_by_type[info.type];
                break;
            case JobStatus::COMPLETED:
                ++stats.completed_jobs;
                break;
            case JobStatus::FAILED:
                ++stats.failed_jobs;
                break;
            case JobStatus::CANCELLED:
                ++stats.cancelled_jobs;
                break;
        }
    }

    // Worker counts
    for (const auto& [type, threads] : typed_workers_) {
        stats.total_workers += static_cast<int>(threads.size());
    }
    stats.busy_workers = static_cast<int>(stats.processing_jobs);
    stats.idle_workers = stats.total_workers - stats.busy_workers;

    return stats;
}

// ============================================================================
// Private Methods
// ============================================================================

std::string JobQueue::generate_job_id() {
    uint64_t counter = ++job_counter_;
    auto now = std::chrono::system_clock::now();
    auto ts = std::chrono::duration_cast<std::chrono::milliseconds>(
        now.time_since_epoch()
    ).count();

    std::ostringstream oss;
    oss << "job_" << std::hex << ts << "_" << counter;
    return oss.str();
}

void JobQueue::worker_thread(JobType type, int worker_id) {
    std::cout << "[JobQueue] Worker started: type="
              << static_cast<int>(type) << " id=" << worker_id << std::endl;

    while (running_.load()) {
        std::string job_id;

        {
            std::unique_lock<std::mutex> lock(queues_mutex_);

            auto& cv = queue_cvs_[type];
            auto& queue = queues_[type];

            cv.wait(lock, [&]() {
                return !running_.load() || !queue.empty();
            });

            if (!running_.load() && queue.empty()) break;

            if (queue.empty()) continue;

            auto entry = queue.top();
            queue.pop();
            job_id = entry.job_id;
        }

        // Check if cancelled
        {
            std::lock_guard<std::mutex> lock(jobs_mutex_);
            auto it = jobs_.find(job_id);
            if (it == jobs_.end() || it->second.status == JobStatus::CANCELLED) {
                continue;
            }
        }

        // Get job and process
        JobInfo job;
        {
            std::lock_guard<std::mutex> lock(jobs_mutex_);
            auto it = jobs_.find(job_id);
            if (it == jobs_.end()) continue;
            job = it->second;
        }

        process_job(job);
    }

    std::cout << "[JobQueue] Worker stopped: type="
              << static_cast<int>(type) << " id=" << worker_id << std::endl;
}

void JobQueue::process_job(JobInfo& job) {
    update_job_status(job.id, JobStatus::PROCESSING);

    {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = jobs_.find(job.id);
        if (it != jobs_.end()) {
            it->second.started_at = std::chrono::system_clock::now();
            job = it->second;
        }
    }

    // Get original request
    JobRequest request;
    {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = job_requests_.find(job.id);
        if (it == job_requests_.end()) {
            update_job_status(job.id, JobStatus::FAILED, "Request not found");
            return;
        }
        request = it->second;
    }

    // Find plugin
    Plugin* plugin = plugin_manager_->find_plugin_for_job(job.type, request.params);
    if (!plugin) {
        std::string msg = "No plugin found to handle job type "
                          + std::to_string(static_cast<int>(job.type));
        update_job_status(job.id, JobStatus::FAILED, msg);
        if (completion_callback_) {
            completion_callback_(job.id, false, msg);
        }
        return;
    }

    // Progress callback
    auto progress_cb = [this](const std::string& job_id, const JobProgress& progress) {
        std::lock_guard<std::mutex> lock(jobs_mutex_);
        auto it = jobs_.find(job_id);
        if (it != jobs_.end()) {
            it->second.progress = progress;
        }
        if (progress_callback_) {
            progress_callback_(job_id, progress);
        }
    };

    // Process
    std::cout << "[JobQueue] Processing job " << job.id << std::endl;
    auto result = plugin->process(request, progress_cb);

    if (result.is_ok()) {
        {
            std::lock_guard<std::mutex> lock(jobs_mutex_);
            auto it = jobs_.find(job.id);
            if (it != jobs_.end()) {
                it->second.output_path = result.value();
                it->second.completed_at = std::chrono::system_clock::now();
            }
        }
        update_job_status(job.id, JobStatus::COMPLETED);
        if (completion_callback_) {
            completion_callback_(job.id, true, result.value());
        }
        std::cout << "[JobQueue] Job completed: " << job.id << std::endl;
    } else {
        update_job_status(job.id, JobStatus::FAILED, result.error_message());
        if (completion_callback_) {
            completion_callback_(job.id, false, result.error_message());
        }
        std::cerr << "[JobQueue] Job failed: " << job.id
                  << " - " << result.error_message() << std::endl;
    }

    // Webhook callback
    if (!request.callback_url.empty()) {
        // Fire-and-forget: log only; real impl would POST via cpr
        std::cout << "[JobQueue] Webhook: " << request.callback_url
                  << " for job " << job.id << std::endl;
    }
}

void JobQueue::update_job_status(
    const std::string& job_id,
    JobStatus status,
    const std::string& error
) {
    std::lock_guard<std::mutex> lock(jobs_mutex_);
    auto it = jobs_.find(job_id);
    if (it == jobs_.end()) return;

    it->second.status = status;
    if (!error.empty()) {
        it->second.error_message = error;
    }
}

void JobQueue::send_notification(const JobInfo& job, NotificationType type) {
    if (config_.notification_callback) {
        Notification n;
        n.tenant_id = job.tenant_id;
        n.user_id = job.user_id;
        n.type = type;

        switch (type) {
            case NotificationType::JOB_STARTED:
                n.title = "Job started";
                n.message = "Job " + job.id + " has started processing";
                n.icon = "info";
                break;
            case NotificationType::JOB_COMPLETED:
                n.title = "Job completed";
                n.message = "Job " + job.id + " completed successfully";
                n.icon = "success";
                break;
            case NotificationType::JOB_FAILED:
                n.title = "Job failed";
                n.message = "Job " + job.id + " failed: " + job.error_message;
                n.icon = "error";
                break;
            default:
                n.title = "Job update";
                n.message = "Job " + job.id + " status changed";
                n.icon = "info";
                break;
        }

        n.data["job_id"] = job.id;
        config_.notification_callback(n);
    }
}

void JobQueue::cleanup_old_jobs() {
    auto now = std::chrono::system_clock::now();

    std::lock_guard<std::mutex> lock(jobs_mutex_);

    std::vector<std::string> to_remove;

    for (const auto& [id, info] : jobs_) {
        if (info.status == JobStatus::COMPLETED) {
            auto age = std::chrono::duration_cast<std::chrono::hours>(
                now - info.completed_at
            ).count();
            if (age >= config_.completed_retention_hours) {
                to_remove.push_back(id);
            }
        } else if (info.status == JobStatus::FAILED || info.status == JobStatus::CANCELLED) {
            auto age = std::chrono::duration_cast<std::chrono::hours>(
                now - info.completed_at
            ).count();
            if (age >= config_.failed_retention_hours) {
                to_remove.push_back(id);
            }
        }
    }

    for (const auto& id : to_remove) {
        jobs_.erase(id);
        job_requests_.erase(id);
    }

    if (!to_remove.empty()) {
        std::cout << "[JobQueue] Cleaned up " << to_remove.size() << " old jobs" << std::endl;
    }
}

void JobQueue::cleanup_thread() {
    while (running_.load()) {
        // Sleep for 1 hour between cleanups
        std::unique_lock<std::mutex> lock(jobs_mutex_);
        cleanup_cv_.wait_for(lock, std::chrono::hours(1), [this]() {
            return !running_.load();
        });

        if (!running_.load()) break;

        lock.unlock();
        cleanup_old_jobs();
    }
}

} // namespace media
