/**
 * @file radio_plugin.hpp
 * @brief Radio streaming plugin - handles internet radio station management
 * 
 * Provides live audio streaming with playlist management, DJ automation,
 * and Icecast/Shoutcast output.
 */

#pragma once

#include "media/plugin.hpp"
#include <vector>
#include <memory>
#include <atomic>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>

namespace media::plugins {

/**
 * @brief Audio source types for radio streams
 */
enum class AudioSourceType {
    File,           ///< Local audio file
    Playlist,       ///< M3U/PLS playlist
    Stream,         ///< Remote stream URL
    Microphone,     ///< Live mic input
    LineIn,         ///< Line-in audio
    Silence         ///< Generate silence (fallback)
};

/**
 * @brief Radio station configuration
 */
struct RadioStationConfig {
    std::string station_id;
    std::string name;
    std::string description;
    std::string genre;
    
    // Stream settings
    std::string mount_point;        ///< e.g., "/live"
    int bitrate = 128;              ///< kbps
    int sample_rate = 44100;        ///< Hz
    int channels = 2;               ///< 1=mono, 2=stereo
    std::string codec = "mp3";      ///< mp3, ogg, aac, opus
    
    // Icecast/Shoutcast output
    std::string server_host = "localhost";
    int server_port = 8000;
    std::string server_password;
    std::string server_type = "icecast";  ///< icecast, shoutcast
    
    // Metadata
    std::string stream_url;
    std::string website_url;
    std::string logo_url;
    
    // Automation
    bool auto_dj = true;
    std::string playlist_path;
    bool shuffle = true;
    bool crossfade = true;
    int crossfade_duration_ms = 3000;
    float normalization_target_db = -14.0f;
};

/**
 * @brief Track in the radio queue
 */
struct RadioTrack {
    std::string id;
    std::string path;
    std::string title;
    std::string artist;
    std::string album;
    int duration_ms = 0;
    AudioSourceType source_type = AudioSourceType::File;
    std::map<std::string, std::string> metadata;
};

/**
 * @brief Live DJ session info
 */
struct DjSession {
    std::string dj_id;
    std::string dj_name;
    std::chrono::system_clock::time_point start_time;
    bool is_live = false;
    std::string source_url;  ///< DJ's stream source
};

/**
 * @brief Radio station runtime state
 */
struct RadioStationState {
    std::string station_id;
    bool is_streaming = false;
    int listener_count = 0;
    
    RadioTrack current_track;
    int playback_position_ms = 0;
    
    std::vector<RadioTrack> queue;
    std::vector<RadioTrack> history;
    
    std::optional<DjSession> active_dj;
    
    // Audio levels
    float peak_left = 0.0f;
    float peak_right = 0.0f;
    float rms_left = 0.0f;
    float rms_right = 0.0f;
};

/**
 * @brief Radio streaming plugin
 * 
 * Manages multiple radio stations with:
 * - Auto-DJ with playlist rotation
 * - Live DJ takeover support
 * - Crossfading and normalization
 * - Icecast/Shoutcast output
 * - Metadata updates
 */
class RadioPlugin : public Plugin {
public:
    RadioPlugin();
    ~RadioPlugin() override;
    
    // Plugin interface
    auto name() const -> std::string override { return "radio"; }
    auto version() const -> std::string override { return "1.0.0"; }
    auto description() const -> std::string override {
        return "Internet radio streaming with auto-DJ and live broadcast support";
    }
    
    auto initialize(const nlohmann::json& config) -> Result<void> override;
    auto shutdown() -> Result<void> override;
    
    auto can_handle(JobType type) const -> bool override;
    auto process(const Job& job, ProgressCallback on_progress) -> Result<nlohmann::json> override;
    auto cancel(const std::string& job_id) -> Result<void> override;
    
    auto supported_job_types() const -> std::vector<JobType> override {
        return { JobType::RadioStream };
    }
    
    // Station management
    auto create_station(const RadioStationConfig& config) -> Result<std::string>;
    auto update_station(const std::string& station_id, const RadioStationConfig& config) -> Result<void>;
    auto delete_station(const std::string& station_id) -> Result<void>;
    auto get_station(const std::string& station_id) -> Result<RadioStationConfig>;
    auto list_stations() -> std::vector<RadioStationConfig>;
    
    // Streaming control
    auto start_stream(const std::string& station_id) -> Result<void>;
    auto stop_stream(const std::string& station_id) -> Result<void>;
    auto get_station_state(const std::string& station_id) -> Result<RadioStationState>;
    
    // Queue management
    auto add_to_queue(const std::string& station_id, const RadioTrack& track) -> Result<void>;
    auto remove_from_queue(const std::string& station_id, const std::string& track_id) -> Result<void>;
    auto clear_queue(const std::string& station_id) -> Result<void>;
    auto skip_track(const std::string& station_id) -> Result<void>;
    auto get_queue(const std::string& station_id) -> Result<std::vector<RadioTrack>>;
    
    // Live DJ
    auto start_dj_session(const std::string& station_id, const DjSession& dj) -> Result<void>;
    auto end_dj_session(const std::string& station_id) -> Result<void>;
    
    // Metadata
    auto update_metadata(const std::string& station_id, const std::string& title, 
                        const std::string& artist) -> Result<void>;
    
private:
    struct StationRuntime;
    std::map<std::string, std::unique_ptr<StationRuntime>> stations_;
    std::mutex stations_mutex_;
    
    auto load_playlist(const std::string& path) -> Result<std::vector<RadioTrack>>;
    auto encode_audio_frame(StationRuntime& station, const std::vector<float>& samples) -> Result<std::vector<uint8_t>>;
    auto send_to_server(StationRuntime& station, const std::vector<uint8_t>& data) -> Result<void>;
    auto apply_crossfade(std::vector<float>& current, const std::vector<float>& next, int position) -> void;
    auto normalize_audio(std::vector<float>& samples, float target_db) -> void;
    void stream_loop(const std::string& station_id);
};

} // namespace media::plugins

MEDIA_PLUGIN_EXPORT(media::plugins::RadioPlugin)
