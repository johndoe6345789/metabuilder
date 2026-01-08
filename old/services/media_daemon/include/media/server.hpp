#pragma once

#include "media/types.hpp"
#include "media/plugin_manager.hpp"
#include "media/job_queue.hpp"
#include "media/radio_engine.hpp"
#include "media/tv_engine.hpp"
#include "media/dbal_client.hpp"
#include <memory>
#include <atomic>
#include <string>

namespace media {

/**
 * Media Daemon Server Configuration
 */
struct ServerConfig {
    // Network
    std::string bind_address = "0.0.0.0";
    int port = 8090;
    int workers = 4;
    bool development_mode = false;
    
    // DBAL
    DbalClientConfig dbal;
    
    // Job Queue
    JobQueueConfig job_queue;
    
    // Radio
    bool radio_enabled = true;
    RadioEngineConfig radio;
    
    // TV
    bool tv_enabled = true;
    TvEngineConfig tv;
    
    // Plugins
    bool plugins_enabled = true;
    std::string plugin_dir = "/plugins";
    bool hot_reload = false;
    
    // Security
    bool api_keys_enabled = true;
    std::string api_key_header = "X-API-Key";
    bool rate_limit_enabled = true;
    int rate_limit_rpm = 100;
    
    // CORS
    bool cors_enabled = true;
    std::vector<std::string> cors_origins = {"*"};
    
    // Monitoring
    bool prometheus_enabled = true;
    std::string prometheus_endpoint = "/metrics";
    std::string health_endpoint = "/health";
};

/**
 * Media Daemon Server
 * 
 * Main HTTP server for the media processing daemon.
 * Uses Drogon framework (same as DBAL daemon).
 */
class Server {
public:
    Server();
    ~Server();
    
    // Disable copying
    Server(const Server&) = delete;
    Server& operator=(const Server&) = delete;
    
    // ========================================================================
    // Lifecycle
    // ========================================================================
    
    /**
     * Initialize the server
     * @param config Server configuration
     * @return Result indicating success or failure
     */
    Result<void> initialize(const ServerConfig& config);
    
    /**
     * Start the server (blocking)
     */
    void run();
    
    /**
     * Start the server (non-blocking)
     */
    void start();
    
    /**
     * Stop the server
     */
    void stop();
    
    /**
     * Check if server is running
     */
    bool is_running() const { return running_.load(); }
    
    // ========================================================================
    // Component Access
    // ========================================================================
    
    PluginManager& plugin_manager() { return *plugin_manager_; }
    JobQueue& job_queue() { return *job_queue_; }
    RadioEngine& radio_engine() { return *radio_engine_; }
    TvEngine& tv_engine() { return *tv_engine_; }
    DbalClient& dbal_client() { return *dbal_client_; }
    
    const PluginManager& plugin_manager() const { return *plugin_manager_; }
    const JobQueue& job_queue() const { return *job_queue_; }
    const RadioEngine& radio_engine() const { return *radio_engine_; }
    const TvEngine& tv_engine() const { return *tv_engine_; }
    const DbalClient& dbal_client() const { return *dbal_client_; }
    
private:
    /**
     * Setup HTTP routes
     */
    void setup_routes();
    
    /**
     * Setup middleware (auth, rate limiting, CORS)
     */
    void setup_middleware();
    
    /**
     * Register built-in plugins
     */
    Result<void> register_builtin_plugins();
    
    // ========================================================================
    // Route Handlers
    // ========================================================================
    
    // Health
    void handle_health();
    void handle_metrics();
    
    // Jobs
    void handle_create_job();
    void handle_get_job();
    void handle_list_jobs();
    void handle_cancel_job();
    
    // Radio
    void handle_create_radio_channel();
    void handle_get_radio_channel();
    void handle_list_radio_channels();
    void handle_start_radio();
    void handle_stop_radio();
    void handle_set_playlist();
    void handle_get_now_playing();
    
    // TV
    void handle_create_tv_channel();
    void handle_get_tv_channel();
    void handle_list_tv_channels();
    void handle_start_tv();
    void handle_stop_tv();
    void handle_set_schedule();
    void handle_get_epg();
    
    // Plugins
    void handle_list_plugins();
    void handle_reload_plugin();
    
    // Configuration
    ServerConfig config_;
    
    // State
    std::atomic<bool> initialized_{false};
    std::atomic<bool> running_{false};
    
    // Components
    std::unique_ptr<PluginManager> plugin_manager_;
    std::unique_ptr<JobQueue> job_queue_;
    std::unique_ptr<RadioEngine> radio_engine_;
    std::unique_ptr<TvEngine> tv_engine_;
    std::unique_ptr<DbalClient> dbal_client_;
    
    // Drogon app (pimpl)
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace media
