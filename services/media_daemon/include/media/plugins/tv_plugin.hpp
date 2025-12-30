/**
 * @file tv_plugin.hpp
 * @brief TV channel simulation plugin - 24/7 broadcast with EPG
 * 
 * Simulates traditional TV channels with scheduled programming,
 * commercials, bumpers, and electronic program guide.
 */

#pragma once

#include "media/plugin.hpp"
#include <vector>
#include <memory>
#include <atomic>
#include <thread>
#include <chrono>

namespace media::plugins {

/**
 * @brief Content rating for TV programs
 */
enum class ContentRating {
    TV_Y,       ///< All children
    TV_Y7,      ///< Children 7+
    TV_G,       ///< General audience
    TV_PG,      ///< Parental guidance
    TV_14,      ///< Parents strongly cautioned
    TV_MA       ///< Mature audiences
};

/**
 * @brief Program category for EPG
 */
enum class ProgramCategory {
    Movie,
    Series,
    News,
    Sports,
    Documentary,
    Kids,
    Music,
    Educational,
    Talk,
    Reality,
    Commercial,
    Bumper,
    SignOff
};

/**
 * @brief TV channel configuration
 */
struct TvChannelConfig {
    std::string channel_id;
    std::string name;
    std::string call_sign;          ///< e.g., "WXYZ"
    int channel_number = 0;
    std::string logo_url;
    std::string description;
    
    // Stream output settings
    std::string output_format = "hls";  ///< hls, dash, rtmp
    std::string output_path;            ///< HLS: directory, RTMP: url
    int video_bitrate = 4000;           ///< kbps
    int audio_bitrate = 128;            ///< kbps
    std::string resolution = "1920x1080";
    int fps = 30;
    
    // Broadcast settings
    std::string timezone = "America/New_York";
    bool broadcast_24_7 = true;
    std::string sign_off_video;         ///< Video to play during off-hours
    std::string technical_difficulties_video;
    
    // Bumpers and interstitials
    std::vector<std::string> station_id_videos;  ///< Channel ID bumpers
    std::vector<std::string> commercial_pool;
    int commercial_break_interval_min = 15;
    int commercial_break_duration_sec = 180;
    
    // Watermark/overlay
    bool show_logo = true;
    std::string logo_position = "top-right";
    float logo_opacity = 0.8f;
    bool show_clock = false;
    bool show_rating = true;
};

/**
 * @brief Scheduled program in the TV lineup
 */
struct TvProgram {
    std::string program_id;
    std::string title;
    std::string description;
    std::string video_path;
    
    std::chrono::system_clock::time_point start_time;
    std::chrono::minutes duration;
    
    ProgramCategory category = ProgramCategory::Movie;
    ContentRating rating = ContentRating::TV_G;
    
    std::string series_name;
    int season = 0;
    int episode = 0;
    
    std::vector<std::string> genres;
    std::vector<std::string> cast;
    std::string director;
    int year = 0;
    
    std::string thumbnail_url;
    
    // Playback options
    bool allow_commercials = true;
    bool show_rating_card = true;
    int rating_card_duration_sec = 5;
};

/**
 * @brief EPG (Electronic Program Guide) entry
 */
struct EpgEntry {
    std::string channel_id;
    TvProgram program;
    bool is_live = false;
    bool is_repeat = false;
    std::string original_air_date;
};

/**
 * @brief TV channel runtime state
 */
struct TvChannelState {
    std::string channel_id;
    bool is_broadcasting = false;
    
    TvProgram current_program;
    std::chrono::seconds playback_position{0};
    
    TvProgram next_program;
    std::chrono::seconds time_until_next{0};
    
    bool in_commercial_break = false;
    int commercial_index = 0;
    
    int viewer_count = 0;
    
    // Stream health
    int dropped_frames = 0;
    float encoding_fps = 0.0f;
    int buffer_health_percent = 100;
};

/**
 * @brief TV broadcast plugin
 * 
 * Simulates traditional TV channels with:
 * - Scheduled programming from EPG
 * - Automatic commercial breaks
 * - Station ID bumpers
 * - Logo overlay and clock
 * - Rating cards before programs
 * - HLS/DASH/RTMP output
 */
class TvPlugin : public Plugin {
public:
    TvPlugin();
    ~TvPlugin() override;
    
    // Plugin interface
    auto name() const -> std::string override { return "tv"; }
    auto version() const -> std::string override { return "1.0.0"; }
    auto description() const -> std::string override {
        return "TV channel simulation with EPG, scheduling, and 24/7 broadcast";
    }
    
    auto initialize(const nlohmann::json& config) -> Result<void> override;
    auto shutdown() -> Result<void> override;
    
    auto can_handle(JobType type) const -> bool override;
    auto process(const Job& job, ProgressCallback on_progress) -> Result<nlohmann::json> override;
    auto cancel(const std::string& job_id) -> Result<void> override;
    
    auto supported_job_types() const -> std::vector<JobType> override {
        return { JobType::TvBroadcast };
    }
    
    // Channel management
    auto create_channel(const TvChannelConfig& config) -> Result<std::string>;
    auto update_channel(const std::string& channel_id, const TvChannelConfig& config) -> Result<void>;
    auto delete_channel(const std::string& channel_id) -> Result<void>;
    auto get_channel(const std::string& channel_id) -> Result<TvChannelConfig>;
    auto list_channels() -> std::vector<TvChannelConfig>;
    
    // Broadcast control
    auto start_broadcast(const std::string& channel_id) -> Result<void>;
    auto stop_broadcast(const std::string& channel_id) -> Result<void>;
    auto get_channel_state(const std::string& channel_id) -> Result<TvChannelState>;
    
    // Schedule/EPG management
    auto add_program(const std::string& channel_id, const TvProgram& program) -> Result<void>;
    auto remove_program(const std::string& channel_id, const std::string& program_id) -> Result<void>;
    auto update_program(const std::string& channel_id, const TvProgram& program) -> Result<void>;
    auto get_schedule(const std::string& channel_id, 
                     std::chrono::system_clock::time_point start,
                     std::chrono::system_clock::time_point end) -> Result<std::vector<TvProgram>>;
    
    // EPG export
    auto export_epg_xmltv(const std::vector<std::string>& channel_ids) -> Result<std::string>;
    auto export_epg_json(const std::vector<std::string>& channel_ids) -> Result<nlohmann::json>;
    
    // Emergency broadcast
    auto trigger_emergency_alert(const std::string& channel_id, 
                                 const std::string& message,
                                 const std::string& audio_path = "") -> Result<void>;
    auto clear_emergency_alert(const std::string& channel_id) -> Result<void>;
    
    // Live takeover
    auto start_live_feed(const std::string& channel_id, const std::string& rtmp_source) -> Result<void>;
    auto end_live_feed(const std::string& channel_id) -> Result<void>;
    
private:
    struct ChannelRuntime;
    std::map<std::string, std::unique_ptr<ChannelRuntime>> channels_;
    std::mutex channels_mutex_;
    
    // FFmpeg pipeline management
    auto build_ffmpeg_pipeline(ChannelRuntime& channel) -> Result<void>;
    auto apply_logo_overlay(ChannelRuntime& channel) -> std::string;
    auto render_rating_card(const TvProgram& program) -> Result<std::string>;
    auto insert_commercial_break(ChannelRuntime& channel) -> Result<void>;
    auto play_station_id(ChannelRuntime& channel) -> Result<void>;
    
    void broadcast_loop(const std::string& channel_id);
    auto select_next_program(ChannelRuntime& channel) -> Result<TvProgram>;
    auto should_insert_commercial(const ChannelRuntime& channel) -> bool;
};

} // namespace media::plugins

MEDIA_PLUGIN_EXPORT(media::plugins::TvPlugin)
