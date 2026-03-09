#pragma once

#include "media/types.hpp"
#include "media/plugin_manager.hpp"
#include <memory>
#include <map>
#include <mutex>
#include <thread>
#include <atomic>
#include <condition_variable>

// Forward declaration — avoids a circular include between radio_engine and
// stream_broadcaster (server.cpp ties them together at link time).
namespace media { class StreamBroadcaster; }

namespace media {

/**
 * Radio Engine Configuration
 */
struct RadioEngineConfig {
    // General
    int max_channels = 10;
    
    // Default audio settings
    int default_bitrate_kbps = 128;
    int default_sample_rate = 44100;
    int default_channels = 2;
    std::string default_codec = "mp3";
    
    // Crossfade
    bool crossfade_enabled = true;
    int crossfade_duration_ms = 3000;
    
    // Normalization
    bool normalization_enabled = true;
    double target_lufs = -14.0;
    
    // Output
    std::string hls_output_dir = "/data/hls/radio";
    int hls_segment_duration = 6;
    
    // Notification callback
    NotificationCallback notification_callback;
};

/**
 * Internal Radio Channel State
 */
struct RadioChannelState {
    RadioChannelConfig config;
    RadioChannelStatus status;
    
    // Playlist
    std::vector<RadioPlaylistEntry> playlist;
    size_t current_index = 0;
    
    // Streaming state
    std::atomic<bool> is_running{false};
    std::thread stream_thread;
    std::condition_variable cv;
    std::mutex mutex;
    
    // FFmpeg process handle (or similar)
    void* process_handle = nullptr;
    
    // Statistics
    std::chrono::system_clock::time_point started_at;
    std::atomic<int> listener_count{0};
};

/**
 * Radio Engine
 * 
 * Manages radio channel streaming with playlist scheduling,
 * crossfading, audio normalization, and multiple output formats.
 */
class RadioEngine {
public:
    RadioEngine();
    ~RadioEngine();
    
    // Disable copying
    RadioEngine(const RadioEngine&) = delete;
    RadioEngine& operator=(const RadioEngine&) = delete;
    
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /**
     * Initialize the radio engine
     * @param config Engine configuration
     * @param plugin_manager Plugin manager for audio processing
     * @return Result indicating success or failure
     */
    Result<void> initialize(
        const RadioEngineConfig& config,
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
     * Create a new radio channel
     * @param config Channel configuration
     * @return Result with channel ID or error
     */
    Result<std::string> create_channel(const RadioChannelConfig& config);
    
    /**
     * Delete a radio channel
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
        const RadioChannelConfig& config
    );
    
    /**
     * Get channel status
     * @param channel_id Channel ID
     * @return Result with channel status or error
     */
    Result<RadioChannelStatus> get_channel_status(
        const std::string& channel_id
    ) const;
    
    /**
     * List all channels
     * @param tenant_id Filter by tenant (empty for all)
     * @return Vector of channel statuses
     */
    std::vector<RadioChannelStatus> list_channels(
        const std::string& tenant_id = ""
    ) const;
    
    // ========================================================================
    // Streaming Control
    // ========================================================================
    
    /**
     * Start streaming a channel
     * @param channel_id Channel ID
     * @return Result with stream URL or error
     */
    Result<std::string> start_channel(const std::string& channel_id);
    
    /**
     * Stop streaming a channel
     * @param channel_id Channel ID
     * @return Result indicating success or failure
     */
    Result<void> stop_channel(const std::string& channel_id);
    
    // ========================================================================
    // Playlist Management
    // ========================================================================
    
    /**
     * Set channel playlist
     * @param channel_id Channel ID
     * @param tracks List of tracks
     * @return Result indicating success or failure
     */
    Result<void> set_playlist(
        const std::string& channel_id,
        const std::vector<RadioTrack>& tracks
    );
    
    /**
     * Add track to playlist
     * @param channel_id Channel ID
     * @param track Track to add
     * @param position Position in playlist (-1 for end)
     * @return Result indicating success or failure
     */
    Result<void> add_track(
        const std::string& channel_id,
        const RadioTrack& track,
        int position = -1
    );
    
    /**
     * Remove track from playlist
     * @param channel_id Channel ID
     * @param track_id Track ID to remove
     * @return Result indicating success or failure
     */
    Result<void> remove_track(
        const std::string& channel_id,
        const std::string& track_id
    );
    
    /**
     * Skip to next track
     * @param channel_id Channel ID
     * @return Result indicating success or failure
     */
    Result<void> skip_track(const std::string& channel_id);
    
    /**
     * Get current playlist
     * @param channel_id Channel ID
     * @return Result with playlist or error
     */
    Result<std::vector<RadioPlaylistEntry>> get_playlist(
        const std::string& channel_id
    ) const;
    
    /**
     * Get now playing info
     * @param channel_id Channel ID
     * @return Result with current track or error
     */
    Result<RadioTrack> get_now_playing(
        const std::string& channel_id
    ) const;
    
    // ========================================================================
    // Auto-DJ
    // ========================================================================
    
    /**
     * Enable/disable auto-DJ for a channel
     * @param channel_id Channel ID
     * @param enabled Enable auto-DJ
     * @param folders Folders to scan for music
     * @param shuffle Shuffle tracks
     * @return Result indicating success or failure
     */
    Result<void> set_auto_dj(
        const std::string& channel_id,
        bool enabled,
        const std::vector<std::string>& folders = {},
        bool shuffle = true
    );
    
    // ========================================================================
    // Statistics
    // ========================================================================
    
    /**
     * Update listener count (called by stream server)
     * @param channel_id Channel ID
     * @param delta Change in listener count
     */
    void update_listener_count(const std::string& channel_id, int delta);
    
    /**
     * Get total listener count across all channels
     */
    int get_total_listeners() const;

    /**
     * Attach a StreamBroadcaster so stream_thread() can push audio chunks
     * to connected HTTP listeners instead of writing to an external Icecast.
     * Must be called before start_channel().
     */
    void set_broadcaster(StreamBroadcaster* b) { broadcaster_ = b; }

private:
    /**
     * Stream thread function
     */
    void stream_thread(const std::string& channel_id);
    
    /**
     * Load next track with crossfade
     */
    void load_next_track(RadioChannelState& state);
    
    /**
     * Apply audio processing (normalization, effects)
     */
    void process_audio(RadioChannelState& state, void* buffer, size_t size);
    
    /**
     * Generate HLS segments
     */
    void generate_hls_segment(
        const std::string& channel_id,
        const void* audio_data,
        size_t size
    );
    
    /**
     * Scan folder for audio files
     */
    std::vector<RadioTrack> scan_folder(const std::string& folder);
    
    /**
     * Get audio metadata from file
     */
    RadioTrack get_track_metadata(const std::string& path);
    
    // Configuration
    RadioEngineConfig config_;
    PluginManager* plugin_manager_ = nullptr;

    // Audio broadcaster (native HTTP streaming — replaces Icecast)
    StreamBroadcaster* broadcaster_ = nullptr;

    // State
    std::atomic<bool> initialized_{false};

    // Channels
    mutable std::mutex channels_mutex_;
    std::map<std::string, std::unique_ptr<RadioChannelState>> channels_;
};

} // namespace media
