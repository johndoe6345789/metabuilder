#pragma once

#include "media/types.hpp"
#include "media/plugin_manager.hpp"
#include <memory>
#include <map>
#include <mutex>
#include <thread>
#include <atomic>
#include <condition_variable>

namespace media {

/**
 * TV Engine Configuration
 */
struct TvEngineConfig {
    // General
    int max_channels = 5;
    
    // Video settings
    struct Resolution {
        std::string name;
        int width;
        int height;
        int bitrate_kbps;
    };
    std::vector<Resolution> resolutions = {
        {"1080p", 1920, 1080, 5000},
        {"720p", 1280, 720, 2500},
        {"480p", 854, 480, 1000}
    };
    std::string default_video_codec = "h264";
    std::string video_preset = "fast";
    
    // Audio settings
    std::string default_audio_codec = "aac";
    int audio_bitrate_kbps = 128;
    int audio_sample_rate = 48000;
    
    // HLS settings
    std::string hls_output_dir = "/data/hls/tv";
    int hls_segment_duration = 4;
    int hls_playlist_size = 10;
    
    // EPG settings
    int epg_lookahead_hours = 24;
    int epg_refresh_interval_minutes = 15;
    
    // Notification callback
    NotificationCallback notification_callback;
};

/**
 * Internal TV Channel State
 */
struct TvChannelState {
    TvChannelConfig config;
    TvChannelStatus status;
    
    // Schedule
    std::vector<TvScheduleEntry> schedule;
    size_t current_program_index = 0;
    
    // Streaming state
    std::atomic<bool> is_running{false};
    std::thread stream_thread;
    std::condition_variable cv;
    std::mutex mutex;
    
    // Current playback position
    std::chrono::system_clock::time_point playback_position;
    
    // FFmpeg process handles per resolution
    std::map<std::string, void*> encoder_handles;
    
    // Statistics
    std::chrono::system_clock::time_point started_at;
    std::atomic<int> viewer_count{0};
};

/**
 * TV Engine
 * 
 * Manages TV channel simulation with scheduling, EPG generation,
 * multi-resolution HLS output, and commercial/bumper insertion.
 */
class TvEngine {
public:
    TvEngine();
    ~TvEngine();
    
    // Disable copying
    TvEngine(const TvEngine&) = delete;
    TvEngine& operator=(const TvEngine&) = delete;
    
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /**
     * Initialize the TV engine
     * @param config Engine configuration
     * @param plugin_manager Plugin manager for video processing
     * @return Result indicating success or failure
     */
    Result<void> initialize(
        const TvEngineConfig& config,
        PluginManager* plugin_manager
    );
    
    /**
     * Shutdown all channels and cleanup
     */
    void shutdown();
    
    // ========================================================================
    // Channel Management
    // ========================================================================
    
    /**
     * Create a new TV channel
     * @param config Channel configuration
     * @return Result with channel ID or error
     */
    Result<std::string> create_channel(const TvChannelConfig& config);
    
    /**
     * Delete a TV channel
     * @param channel_id Channel ID
     * @return Result indicating success or failure
     */
    Result<void> delete_channel(const std::string& channel_id);
    
    /**
     * Update channel configuration
     * @param channel_id Channel ID
     * @param config New configuration
     * @return Result indicating success or failure
     */
    Result<void> update_channel(
        const std::string& channel_id,
        const TvChannelConfig& config
    );
    
    /**
     * Get channel status
     * @param channel_id Channel ID
     * @return Result with channel status or error
     */
    Result<TvChannelStatus> get_channel_status(
        const std::string& channel_id
    ) const;
    
    /**
     * List all channels
     * @param tenant_id Filter by tenant (empty for all)
     * @return Vector of channel statuses
     */
    std::vector<TvChannelStatus> list_channels(
        const std::string& tenant_id = ""
    ) const;
    
    // ========================================================================
    // Streaming Control
    // ========================================================================
    
    /**
     * Start streaming a channel
     * @param channel_id Channel ID
     * @return Result with stream URLs or error
     */
    struct StreamUrls {
        std::string hls_url;
        std::string dash_url;
        std::map<std::string, std::string> quality_urls;  // resolution -> URL
    };
    Result<StreamUrls> start_channel(const std::string& channel_id);
    
    /**
     * Stop streaming a channel
     * @param channel_id Channel ID
     * @return Result indicating success or failure
     */
    Result<void> stop_channel(const std::string& channel_id);
    
    // ========================================================================
    // Schedule Management
    // ========================================================================
    
    /**
     * Set channel schedule
     * @param channel_id Channel ID
     * @param entries Schedule entries
     * @return Result indicating success or failure
     */
    Result<void> set_schedule(
        const std::string& channel_id,
        const std::vector<TvScheduleEntry>& entries
    );
    
    /**
     * Add program to schedule
     * @param channel_id Channel ID
     * @param entry Schedule entry
     * @return Result indicating success or failure
     */
    Result<void> add_program(
        const std::string& channel_id,
        const TvScheduleEntry& entry
    );
    
    /**
     * Remove program from schedule
     * @param channel_id Channel ID
     * @param program_id Program ID
     * @return Result indicating success or failure
     */
    Result<void> remove_program(
        const std::string& channel_id,
        const std::string& program_id
    );
    
    /**
     * Get channel schedule
     * @param channel_id Channel ID
     * @param start_time Start of time range
     * @param end_time End of time range
     * @return Result with schedule or error
     */
    Result<std::vector<TvScheduleEntry>> get_schedule(
        const std::string& channel_id,
        std::chrono::system_clock::time_point start_time,
        std::chrono::system_clock::time_point end_time
    ) const;
    
    // ========================================================================
    // EPG (Electronic Program Guide)
    // ========================================================================
    
    /**
     * Generate EPG for all channels
     * @param hours_ahead Hours of programming to include
     * @return Vector of EPG entries
     */
    std::vector<EpgEntry> generate_epg(int hours_ahead = 24) const;
    
    /**
     * Generate EPG for specific channel
     * @param channel_id Channel ID
     * @param hours_ahead Hours of programming
     * @return Result with EPG entries or error
     */
    Result<std::vector<EpgEntry>> generate_channel_epg(
        const std::string& channel_id,
        int hours_ahead = 24
    ) const;
    
    /**
     * Export EPG as XMLTV format
     * @param hours_ahead Hours of programming
     * @return XMLTV formatted string
     */
    std::string export_xmltv(int hours_ahead = 24) const;
    
    // ========================================================================
    // Now Playing
    // ========================================================================
    
    /**
     * Get current program
     * @param channel_id Channel ID
     * @return Result with current program or error
     */
    Result<TvProgram> get_now_playing(const std::string& channel_id) const;
    
    /**
     * Get next program
     * @param channel_id Channel ID
     * @return Result with next program or error
     */
    Result<TvProgram> get_next_program(const std::string& channel_id) const;
    
    // ========================================================================
    // Interstitials (Bumpers/Commercials)
    // ========================================================================
    
    /**
     * Set channel bumpers
     * @param channel_id Channel ID
     * @param intro_bumper Path to intro bumper video
     * @param outro_bumper Path to outro bumper video
     * @return Result indicating success or failure
     */
    Result<void> set_bumpers(
        const std::string& channel_id,
        const std::string& intro_bumper,
        const std::string& outro_bumper
    );
    
    /**
     * Set commercial break playlist
     * @param channel_id Channel ID
     * @param commercials List of commercial video paths
     * @param break_duration_seconds Target break duration
     * @return Result indicating success or failure
     */
    Result<void> set_commercials(
        const std::string& channel_id,
        const std::vector<std::string>& commercials,
        int break_duration_seconds = 120
    );
    
    // ========================================================================
    // Statistics
    // ========================================================================
    
    /**
     * Update viewer count (called by stream server)
     * @param channel_id Channel ID
     * @param delta Change in viewer count
     */
    void update_viewer_count(const std::string& channel_id, int delta);
    
    /**
     * Get total viewer count across all channels
     */
    int get_total_viewers() const;
    
private:
    /**
     * Stream thread function
     */
    void stream_thread(const std::string& channel_id);
    
    /**
     * Get current program based on schedule
     */
    const TvScheduleEntry* get_current_scheduled_program(
        const TvChannelState& state
    ) const;
    
    /**
     * Prepare next segment
     */
    void prepare_next_segment(TvChannelState& state);
    
    /**
     * Encode video segment
     */
    void encode_segment(
        TvChannelState& state,
        const std::string& input_path,
        double start_time,
        double duration
    );
    
    /**
     * Generate HLS master playlist
     */
    void generate_master_playlist(const std::string& channel_id);
    
    /**
     * Update variant playlists
     */
    void update_variant_playlist(
        const std::string& channel_id,
        const std::string& resolution,
        const std::string& segment_filename
    );
    
    /**
     * Insert bumper/commercial
     */
    void insert_interstitial(
        TvChannelState& state,
        const std::string& video_path
    );
    
    // Configuration
    TvEngineConfig config_;
    PluginManager* plugin_manager_ = nullptr;
    
    // State
    std::atomic<bool> initialized_{false};
    
    // Channels
    mutable std::mutex channels_mutex_;
    std::map<std::string, std::unique_ptr<TvChannelState>> channels_;
    
    // EPG refresh thread
    std::thread epg_thread_;
    std::atomic<bool> epg_running_{false};
};

} // namespace media
