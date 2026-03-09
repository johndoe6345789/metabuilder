#pragma once

#include "media/types.hpp"
#include <memory>
#include <string>
#include <functional>

namespace media {

/**
 * DBAL Client Configuration
 */
struct DbalClientConfig {
    std::string url = "http://localhost:8080";
    std::string api_key;
    int timeout_ms = 5000;
    int retry_attempts = 3;
    int retry_delay_ms = 1000;
};

/**
 * DBAL Client
 * 
 * Handles communication with the DBAL daemon for:
 * - Sending user notifications
 * - Checking user permissions
 * - Storing job metadata
 * - Multi-tenant isolation
 */
class DbalClient {
public:
    DbalClient();
    ~DbalClient();
    
    // Disable copying
    DbalClient(const DbalClient&) = delete;
    DbalClient& operator=(const DbalClient&) = delete;
    
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /**
     * Initialize the DBAL client
     * @param config Client configuration
     * @return Result indicating success or failure
     */
    Result<void> initialize(const DbalClientConfig& config);
    
    /**
     * Check if connected to DBAL
     */
    bool is_connected() const;
    
    /**
     * Test connection to DBAL
     * @return Result indicating success or failure
     */
    Result<void> ping();
    
    // ========================================================================
    // Notifications
    // ========================================================================
    
    /**
     * Send a notification to a user
     * @param notification Notification details
     * @return Result indicating success or failure
     */
    Result<void> send_notification(const Notification& notification);
    
    /**
     * Send job started notification
     */
    Result<void> notify_job_started(
        const std::string& tenant_id,
        const std::string& user_id,
        const std::string& job_id,
        JobType job_type
    );
    
    /**
     * Send job progress notification
     */
    Result<void> notify_job_progress(
        const std::string& tenant_id,
        const std::string& user_id,
        const std::string& job_id,
        const JobProgress& progress
    );
    
    /**
     * Send job completed notification
     */
    Result<void> notify_job_completed(
        const std::string& tenant_id,
        const std::string& user_id,
        const std::string& job_id,
        const std::string& output_path
    );
    
    /**
     * Send job failed notification
     */
    Result<void> notify_job_failed(
        const std::string& tenant_id,
        const std::string& user_id,
        const std::string& job_id,
        const std::string& error_message
    );
    
    /**
     * Send stream started notification
     */
    Result<void> notify_stream_started(
        const std::string& tenant_id,
        const std::string& channel_id,
        const std::string& channel_name,
        const std::string& stream_url
    );
    
    /**
     * Send stream stopped notification
     */
    Result<void> notify_stream_stopped(
        const std::string& tenant_id,
        const std::string& channel_id,
        const std::string& channel_name
    );
    
    // ========================================================================
    // Permissions
    // ========================================================================
    
    /**
     * Check if user has permission for an action
     * @param tenant_id Tenant ID
     * @param user_id User ID
     * @param permission Permission to check
     * @return Result with boolean or error
     */
    Result<bool> check_permission(
        const std::string& tenant_id,
        const std::string& user_id,
        const std::string& permission
    );
    
    /**
     * Get user's permission level
     * @param tenant_id Tenant ID
     * @param user_id User ID
     * @return Result with level (0-6) or error
     */
    Result<int> get_user_level(
        const std::string& tenant_id,
        const std::string& user_id
    );
    
    // ========================================================================
    // Job Storage
    // ========================================================================
    
    /**
     * Store job record in DBAL
     * @param job Job info to store
     * @return Result indicating success or failure
     */
    Result<void> store_job(const JobInfo& job);
    
    /**
     * Update job record in DBAL
     * @param job Updated job info
     * @return Result indicating success or failure
     */
    Result<void> update_job(const JobInfo& job);
    
    /**
     * Get job record from DBAL
     * @param job_id Job ID
     * @return Result with job info or error
     */
    Result<JobInfo> get_job(const std::string& job_id);
    
    /**
     * List jobs from DBAL
     * @param tenant_id Tenant ID filter
     * @param user_id User ID filter (optional)
     * @param limit Max results
     * @param offset Pagination offset
     * @return Result with job list or error
     */
    Result<std::vector<JobInfo>> list_jobs(
        const std::string& tenant_id,
        const std::string& user_id = "",
        size_t limit = 100,
        size_t offset = 0
    );
    
    // ========================================================================
    // Channel Storage
    // ========================================================================
    
    /**
     * Store radio channel config
     */
    Result<void> store_radio_channel(const RadioChannelConfig& config);
    
    /**
     * Store TV channel config
     */
    Result<void> store_tv_channel(const TvChannelConfig& config);
    
    /**
     * Get radio channels for tenant
     */
    Result<std::vector<RadioChannelConfig>> get_radio_channels(
        const std::string& tenant_id
    );
    
    /**
     * Get TV channels for tenant
     */
    Result<std::vector<TvChannelConfig>> get_tv_channels(
        const std::string& tenant_id
    );
    
private:
    /**
     * Make HTTP request to DBAL
     */
    Result<std::string> make_request(
        const std::string& method,
        const std::string& endpoint,
        const std::string& body = ""
    );
    
    /**
     * Retry wrapper
     */
    template<typename Func>
    auto with_retry(Func&& func) -> decltype(func());
    
    DbalClientConfig config_;
    bool initialized_ = false;
    
    // HTTP client handle (cpr or similar)
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace media
