#include "media/tv_engine.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <algorithm>
#include <cstdlib>
#include <ctime>
#include <iomanip>

namespace media {

// Forward declaration of internal encode helper (defined later in this file)
static void do_encode_segment(
    const std::string& hls_output_dir,
    const std::string& channel_id,
    const TvChannelConfig& cfg,
    const TvEngineConfig& engine_cfg,
    const std::string& input_path,
    double start_offset,
    double duration
);

TvEngine::TvEngine() = default;

TvEngine::~TvEngine() {
    shutdown();
}

// ============================================================================
// Initialization
// ============================================================================

Result<void> TvEngine::initialize(
    const TvEngineConfig& config,
    PluginManager* plugin_manager
) {
    config_ = config;
    plugin_manager_ = plugin_manager;

    std::filesystem::create_directories(config_.hls_output_dir);

    // Start EPG refresh thread
    epg_running_.store(true);
    epg_thread_ = std::thread([this]() {
        while (epg_running_.load()) {
            std::this_thread::sleep_for(
                std::chrono::minutes(config_.epg_refresh_interval_minutes)
            );
            if (!epg_running_.load()) break;
            // Trigger EPG regeneration on next access
        }
    });

    initialized_.store(true);
    std::cout << "[TvEngine] Initialized, max_channels=" << config_.max_channels << std::endl;
    return Result<void>::ok();
}

void TvEngine::shutdown() {
    if (!initialized_.load()) return;

    // Stop EPG thread
    epg_running_.store(false);
    if (epg_thread_.joinable()) epg_thread_.join();

    // Stop all channels
    std::lock_guard<std::mutex> lock(channels_mutex_);
    for (auto& [id, state] : channels_) {
        if (state->is_running.load()) {
            state->is_running.store(false);
            state->cv.notify_all();
            if (state->stream_thread.joinable()) {
                state->stream_thread.join();
            }
        }
    }
    channels_.clear();

    initialized_.store(false);
    std::cout << "[TvEngine] Shutdown complete" << std::endl;
}

// ============================================================================
// Channel Management
// ============================================================================

Result<std::string> TvEngine::create_channel(const TvChannelConfig& config) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    if (static_cast<int>(channels_.size()) >= config_.max_channels) {
        return Result<std::string>::error(
            ErrorCode::CONFLICT,
            "Maximum channel limit reached: " + std::to_string(config_.max_channels)
        );
    }

    if (channels_.count(config.id)) {
        return Result<std::string>::error(
            ErrorCode::CONFLICT,
            "Channel already exists: " + config.id
        );
    }

    auto state = std::make_unique<TvChannelState>();
    state->config = config;
    state->status.id = config.id;
    state->status.name = config.name;
    state->status.channel_number = config.channel_number;
    state->status.is_live = false;
    state->status.viewers = 0;

    std::string id = config.id;
    channels_[id] = std::move(state);

    std::cout << "[TvEngine] Created channel: " << id << std::endl;
    return Result<std::string>::ok(id);
}

Result<void> TvEngine::delete_channel(const std::string& channel_id) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    if (state->is_running.load()) {
        state->is_running.store(false);
        state->cv.notify_all();
        if (state->stream_thread.joinable()) {
            state->stream_thread.join();
        }
    }

    channels_.erase(it);
    std::cout << "[TvEngine] Deleted channel: " << channel_id << std::endl;
    return Result<void>::ok();
}

Result<void> TvEngine::update_channel(
    const std::string& channel_id,
    const TvChannelConfig& config
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    it->second->config = config;
    it->second->status.name = config.name;
    it->second->status.channel_number = config.channel_number;
    return Result<void>::ok();
}

Result<TvChannelStatus> TvEngine::get_channel_status(
    const std::string& channel_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<TvChannelStatus>::error(
            ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    return Result<TvChannelStatus>::ok(it->second->status);
}

std::vector<TvChannelStatus> TvEngine::list_channels(
    const std::string& tenant_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    std::vector<TvChannelStatus> result;
    for (const auto& [id, state] : channels_) {
        if (!tenant_id.empty() && state->config.tenant_id != tenant_id) continue;
        result.push_back(state->status);
    }
    return result;
}

// ============================================================================
// Streaming Control
// ============================================================================

Result<TvEngine::StreamUrls> TvEngine::start_channel(const std::string& channel_id) {
    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it == channels_.end()) {
            return Result<StreamUrls>::error(
                ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
        }

        if (it->second->is_running.load()) {
            StreamUrls urls;
            urls.hls_url = it->second->status.hls_url;
            urls.dash_url = it->second->status.dash_url;
            return Result<StreamUrls>::ok(urls);
        }

        // Set up HLS output
        std::string hls_dir = config_.hls_output_dir + "/" + channel_id;
        std::filesystem::create_directories(hls_dir);

        StreamUrls urls;
        urls.hls_url = "/hls/tv/" + channel_id + "/master.m3u8";
        urls.dash_url = "";  // DASH not implemented

        it->second->status.hls_url = urls.hls_url;
        it->second->status.is_live = true;
        it->second->started_at = std::chrono::system_clock::now();
        it->second->is_running.store(true);

        it->second->stream_thread = std::thread([this, channel_id]() {
            stream_thread(channel_id);
        });

        // Generate master HLS playlist
        generate_master_playlist(channel_id);

        if (config_.notification_callback) {
            Notification n;
            n.type = NotificationType::CHANNEL_LIVE;
            n.title = "TV Channel Live";
            n.message = "Channel " + channel_id + " is now broadcasting";
            n.icon = "success";
            n.data["channel_id"] = channel_id;
            config_.notification_callback(n);
        }

        std::cout << "[TvEngine] Started channel: " << channel_id << std::endl;
        return Result<StreamUrls>::ok(urls);
    }
}

Result<void> TvEngine::stop_channel(const std::string& channel_id) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    if (!state->is_running.load()) {
        return Result<void>::ok();
    }

    state->is_running.store(false);
    state->cv.notify_all();
    if (state->stream_thread.joinable()) {
        state->stream_thread.join();
    }

    state->status.is_live = false;
    state->status.now_playing = std::nullopt;
    state->status.next_program = std::nullopt;

    std::cout << "[TvEngine] Stopped channel: " << channel_id << std::endl;
    return Result<void>::ok();
}

// ============================================================================
// Schedule Management
// ============================================================================

Result<void> TvEngine::set_schedule(
    const std::string& channel_id,
    const std::vector<TvScheduleEntry>& entries
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);
    state->schedule = entries;
    state->current_program_index = 0;

    // Sort by start time
    std::sort(state->schedule.begin(), state->schedule.end(),
        [](const TvScheduleEntry& a, const TvScheduleEntry& b) {
            return a.start_time < b.start_time;
        });

    return Result<void>::ok();
}

Result<void> TvEngine::add_program(
    const std::string& channel_id,
    const TvScheduleEntry& entry
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);

    state->schedule.push_back(entry);

    // Keep sorted by start time
    std::sort(state->schedule.begin(), state->schedule.end(),
        [](const TvScheduleEntry& a, const TvScheduleEntry& b) {
            return a.start_time < b.start_time;
        });

    return Result<void>::ok();
}

Result<void> TvEngine::remove_program(
    const std::string& channel_id,
    const std::string& program_id
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);

    auto& schedule = state->schedule;
    auto rit = std::remove_if(schedule.begin(), schedule.end(),
        [&program_id](const TvScheduleEntry& e) {
            return e.program.id == program_id;
        });

    if (rit == schedule.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Program not found: " + program_id);
    }

    schedule.erase(rit, schedule.end());
    return Result<void>::ok();
}

Result<std::vector<TvScheduleEntry>> TvEngine::get_schedule(
    const std::string& channel_id,
    std::chrono::system_clock::time_point start_time,
    std::chrono::system_clock::time_point end_time
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<std::vector<TvScheduleEntry>>::error(
            ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    std::vector<TvScheduleEntry> result;
    for (const auto& entry : it->second->schedule) {
        if (entry.start_time >= start_time && entry.start_time <= end_time) {
            result.push_back(entry);
        }
    }

    return Result<std::vector<TvScheduleEntry>>::ok(result);
}

// ============================================================================
// EPG
// ============================================================================

std::vector<EpgEntry> TvEngine::generate_epg(int hours_ahead) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    std::vector<EpgEntry> epg;
    auto now = std::chrono::system_clock::now();
    auto end = now + std::chrono::hours(hours_ahead);

    for (const auto& [channel_id, state] : channels_) {
        for (const auto& entry : state->schedule) {
            if (entry.start_time >= now && entry.start_time <= end) {
                EpgEntry epg_entry;
                epg_entry.channel_id = channel_id;
                epg_entry.channel_name = state->config.name;
                epg_entry.program = entry.program;
                epg_entry.start_time = entry.start_time;
                epg_entry.end_time = entry.end_time;
                epg.push_back(epg_entry);
            }
        }
    }

    // Sort by channel then start time
    std::sort(epg.begin(), epg.end(), [](const EpgEntry& a, const EpgEntry& b) {
        if (a.channel_id != b.channel_id) return a.channel_id < b.channel_id;
        return a.start_time < b.start_time;
    });

    return epg;
}

Result<std::vector<EpgEntry>> TvEngine::generate_channel_epg(
    const std::string& channel_id,
    int hours_ahead
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<std::vector<EpgEntry>>::error(
            ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    std::vector<EpgEntry> result;
    auto now = std::chrono::system_clock::now();
    auto end = now + std::chrono::hours(hours_ahead);

    for (const auto& entry : it->second->schedule) {
        if (entry.start_time >= now && entry.start_time <= end) {
            EpgEntry epg_entry;
            epg_entry.channel_id = channel_id;
            epg_entry.channel_name = it->second->config.name;
            epg_entry.program = entry.program;
            epg_entry.start_time = entry.start_time;
            epg_entry.end_time = entry.end_time;
            result.push_back(epg_entry);
        }
    }

    return Result<std::vector<EpgEntry>>::ok(result);
}

std::string TvEngine::export_xmltv(int hours_ahead) const {
    auto epg = generate_epg(hours_ahead);

    std::ostringstream xml;
    xml << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    xml << "<!DOCTYPE tv SYSTEM \"xmltv.dtd\">\n";
    xml << "<tv generator-info-name=\"MetaBuilder Media Daemon\">\n";

    // Collect unique channels
    std::map<std::string, std::string> channel_names;
    for (const auto& entry : epg) {
        channel_names[entry.channel_id] = entry.channel_name;
    }

    // Channel declarations
    for (const auto& [id, name] : channel_names) {
        xml << "  <channel id=\"" << id << "\">\n";
        xml << "    <display-name>" << name << "</display-name>\n";
        xml << "  </channel>\n";
    }

    // Programme entries
    auto time_to_xmltv = [](std::chrono::system_clock::time_point tp) -> std::string {
        std::time_t t = std::chrono::system_clock::to_time_t(tp);
        std::tm* tm = std::gmtime(&t);
        char buf[32];
        std::strftime(buf, sizeof(buf), "%Y%m%d%H%M%S +0000", tm);
        return std::string(buf);
    };

    for (const auto& entry : epg) {
        xml << "  <programme start=\"" << time_to_xmltv(entry.start_time)
            << "\" stop=\"" << time_to_xmltv(entry.end_time)
            << "\" channel=\"" << entry.channel_id << "\">\n";
        xml << "    <title>" << entry.program.title << "</title>\n";
        if (!entry.program.description.empty()) {
            xml << "    <desc>" << entry.program.description << "</desc>\n";
        }
        if (!entry.program.category.empty()) {
            xml << "    <category>" << entry.program.category << "</category>\n";
        }
        xml << "  </programme>\n";
    }

    xml << "</tv>\n";
    return xml.str();
}

// ============================================================================
// Now Playing
// ============================================================================

Result<TvProgram> TvEngine::get_now_playing(const std::string& channel_id) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<TvProgram>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    if (!it->second->status.now_playing.has_value()) {
        return Result<TvProgram>::error(ErrorCode::NOT_FOUND, "Nothing playing");
    }

    return Result<TvProgram>::ok(it->second->status.now_playing.value());
}

Result<TvProgram> TvEngine::get_next_program(const std::string& channel_id) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<TvProgram>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    if (!it->second->status.next_program.has_value()) {
        return Result<TvProgram>::error(ErrorCode::NOT_FOUND, "No next program");
    }

    return Result<TvProgram>::ok(it->second->status.next_program.value());
}

// ============================================================================
// Bumpers / Commercials
// ============================================================================

Result<void> TvEngine::set_bumpers(
    const std::string& channel_id,
    const std::string& intro_bumper,
    const std::string& outro_bumper
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    // Store bumpers in metadata
    it->second->config.filler_playlist = intro_bumper;  // Reuse filler as intro
    it->second->config.offline_image = outro_bumper;    // Reuse offline as outro

    return Result<void>::ok();
}

Result<void> TvEngine::set_commercials(
    const std::string& channel_id,
    const std::vector<std::string>& commercials,
    int break_duration_seconds
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    // Store in config as filler playlist (simple approach)
    // A full impl would store in a dedicated commercials list
    if (!commercials.empty()) {
        it->second->config.filler_playlist = commercials[0];
    }

    return Result<void>::ok();
}

// ============================================================================
// Statistics
// ============================================================================

void TvEngine::update_viewer_count(const std::string& channel_id, int delta) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) return;

    it->second->viewer_count.fetch_add(delta);
    it->second->status.viewers = it->second->viewer_count.load();
}

int TvEngine::get_total_viewers() const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    int total = 0;
    for (const auto& [id, state] : channels_) {
        total += state->viewer_count.load();
    }
    return total;
}

// ============================================================================
// Private: Stream Thread
// ============================================================================

void TvEngine::stream_thread(const std::string& channel_id) {
    std::cout << "[TvEngine] Stream thread started: " << channel_id << std::endl;

    while (true) {
        // Check if still running
        {
            std::lock_guard<std::mutex> lock(channels_mutex_);
            auto it = channels_.find(channel_id);
            if (it == channels_.end() || !it->second->is_running.load()) break;
        }

        // Get current scheduled program
        TvChannelConfig cfg;
        const TvScheduleEntry* current_entry = nullptr;

        {
            std::lock_guard<std::mutex> lock(channels_mutex_);
            auto it = channels_.find(channel_id);
            if (it == channels_.end() || !it->second->is_running.load()) break;

            cfg = it->second->config;
            current_entry = get_current_scheduled_program(*it->second);

            if (current_entry) {
                it->second->status.now_playing = current_entry->program;
            } else {
                it->second->status.now_playing = std::nullopt;
            }
        }

        if (!current_entry) {
            // No scheduled content - play filler or sleep
            if (!cfg.filler_playlist.empty() && std::filesystem::exists(cfg.filler_playlist)) {
                do_encode_segment(config_.hls_output_dir, channel_id, cfg, config_,
                                  cfg.filler_playlist, 0.0,
                                  static_cast<double>(cfg.segment_duration_seconds));
            } else {
                std::this_thread::sleep_for(std::chrono::seconds(cfg.segment_duration_seconds));
            }
            continue;
        }

        // Encode current program segment
        const std::string& content_path = current_entry->program.content_path;
        if (!content_path.empty() && std::filesystem::exists(content_path)) {
            auto now = std::chrono::system_clock::now();
            double start_offset = std::chrono::duration<double>(
                now - current_entry->start_time
            ).count();
            if (start_offset < 0) start_offset = 0;

            do_encode_segment(config_.hls_output_dir, channel_id, cfg, config_,
                              content_path, start_offset,
                              static_cast<double>(cfg.segment_duration_seconds));
        } else {
            std::this_thread::sleep_for(std::chrono::seconds(cfg.segment_duration_seconds));
        }
    }

    // Mark stopped
    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it != channels_.end()) {
            it->second->status.is_live = false;
            it->second->status.now_playing = std::nullopt;
        }
    }

    std::cout << "[TvEngine] Stream thread stopped: " << channel_id << std::endl;
}

const TvScheduleEntry* TvEngine::get_current_scheduled_program(
    const TvChannelState& state
) const {
    auto now = std::chrono::system_clock::now();

    for (const auto& entry : state.schedule) {
        if (entry.start_time <= now && entry.end_time > now) {
            return &entry;
        }
    }

    return nullptr;
}

// Internal helper (not in header - used only from stream_thread)
static void do_encode_segment(
    const std::string& hls_output_dir,
    const std::string& channel_id,
    const TvChannelConfig& cfg,
    const TvEngineConfig& engine_cfg,
    const std::string& input_path,
    double start_offset,
    double duration
) {
    std::string hls_dir = hls_output_dir + "/" + channel_id;
    std::filesystem::create_directories(hls_dir);

    std::string cmd = "/usr/bin/ffmpeg"
        " -ss " + std::to_string(start_offset)
        + " -i \"" + input_path + "\""
        + " -t " + std::to_string(duration)
        + " -c:v " + cfg.codec
        + " -preset " + engine_cfg.video_preset
        + " -c:a " + engine_cfg.default_audio_codec
        + " -b:a " + std::to_string(engine_cfg.audio_bitrate_kbps) + "k"
        + " -ar " + std::to_string(engine_cfg.audio_sample_rate)
        + " -hls_time " + std::to_string(engine_cfg.hls_segment_duration)
        + " -hls_list_size " + std::to_string(engine_cfg.hls_playlist_size)
        + " -hls_flags delete_segments+append_list"
        + " -hls_segment_filename \"" + hls_dir + "/seg_%05d.ts\""
        + " \"" + hls_dir + "/stream.m3u8\""
        + " -y 2>/dev/null";

    std::system(cmd.c_str());
}

void TvEngine::prepare_next_segment(TvChannelState& state) {
    // Handled by stream_thread
    (void)state;
}

void TvEngine::encode_segment(
    TvChannelState& /*state*/,
    const std::string& input_path,
    double start_time,
    double duration
) {
    // Delegated to encode_segment_ffmpeg
    (void)input_path;
    (void)start_time;
    (void)duration;
}

void TvEngine::generate_master_playlist(const std::string& channel_id) {
    std::string hls_dir = config_.hls_output_dir + "/" + channel_id;
    std::filesystem::create_directories(hls_dir);

    TvChannelConfig cfg;
    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it == channels_.end()) return;
        cfg = it->second->config;
    }

    std::ofstream master(hls_dir + "/master.m3u8");
    if (!master.is_open()) return;

    master << "#EXTM3U\n";
    master << "#EXT-X-VERSION:3\n\n";

    // Write variant streams based on configured resolutions
    for (const auto& res : config_.resolutions) {
        master << "#EXT-X-STREAM-INF:BANDWIDTH="
               << (res.bitrate_kbps * 1000)
               << ",RESOLUTION=" << res.width << "x" << res.height
               << ",CODECS=\"avc1.42E01E,mp4a.40.2\"\n";
        master << res.name << "/stream.m3u8\n";

        // Create sub-directory for this resolution
        std::filesystem::create_directories(hls_dir + "/" + res.name);
    }

    // Fallback to single stream.m3u8
    if (config_.resolutions.empty()) {
        master << "#EXT-X-STREAM-INF:BANDWIDTH=4000000\n";
        master << "stream.m3u8\n";
    }

    master.close();
    std::cout << "[TvEngine] Generated master playlist for channel: " << channel_id << std::endl;
}

void TvEngine::update_variant_playlist(
    const std::string& channel_id,
    const std::string& resolution,
    const std::string& segment_filename
) {
    std::string hls_dir = config_.hls_output_dir + "/" + channel_id + "/" + resolution;
    std::filesystem::create_directories(hls_dir);

    std::string playlist_path = hls_dir + "/stream.m3u8";

    // This is normally managed by ffmpeg's HLS muxer
    // For a manual implementation we'd track segments here
    (void)segment_filename;
    (void)playlist_path;
}

void TvEngine::insert_interstitial(
    TvChannelState& state,
    const std::string& video_path
) {
    if (video_path.empty() || !std::filesystem::exists(video_path)) return;

    std::string hls_dir = config_.hls_output_dir + "/" + state.config.id;
    std::string cmd = "/usr/bin/ffmpeg"
        " -i \"" + video_path + "\""
        " -c:v copy -c:a copy"
        " -hls_time " + std::to_string(config_.hls_segment_duration)
        + " -hls_list_size " + std::to_string(config_.hls_playlist_size)
        + " -hls_flags delete_segments+append_list"
        + " \"" + hls_dir + "/stream.m3u8\""
        + " -y 2>/dev/null";

    std::system(cmd.c_str());
}

} // namespace media
