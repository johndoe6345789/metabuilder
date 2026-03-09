#include "media/radio_engine.hpp"
#include "media/stream_broadcaster.hpp"
#include <iostream>
#include <filesystem>
#include <sstream>
#include <cstdlib>
#include <cstdio>
#include <algorithm>
#include <random>
#include <chrono>

#ifndef _WIN32
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>
#endif

namespace media {

RadioEngine::RadioEngine() = default;

RadioEngine::~RadioEngine() {
    shutdown();
}

// ============================================================================
// Initialization
// ============================================================================

Result<void> RadioEngine::initialize(
    const RadioEngineConfig& config,
    PluginManager* plugin_manager
) {
    config_ = config;
    plugin_manager_ = plugin_manager;

    // Ensure HLS output directory exists
    std::filesystem::create_directories(config_.hls_output_dir);

    initialized_.store(true);
    std::cout << "[RadioEngine] Initialized, max_channels=" << config_.max_channels << std::endl;
    return Result<void>::ok();
}

void RadioEngine::shutdown() {
    if (!initialized_.load()) return;

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
    std::cout << "[RadioEngine] Shutdown complete" << std::endl;
}

// ============================================================================
// Channel Management
// ============================================================================

Result<std::string> RadioEngine::create_channel(const RadioChannelConfig& config) {
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

    auto state = std::make_unique<RadioChannelState>();
    state->config = config;
    state->status.id = config.id;
    state->status.name = config.name;
    state->status.is_live = false;
    state->status.listeners = 0;

    std::string id = config.id;
    channels_[id] = std::move(state);

    std::cout << "[RadioEngine] Created channel: " << id << std::endl;
    return Result<std::string>::ok(id);
}

Result<void> RadioEngine::delete_channel(const std::string& channel_id) {
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
    std::cout << "[RadioEngine] Deleted channel: " << channel_id << std::endl;
    return Result<void>::ok();
}

Result<void> RadioEngine::update_channel(
    const std::string& channel_id,
    const RadioChannelConfig& config
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    it->second->config = config;
    it->second->status.name = config.name;
    return Result<void>::ok();
}

Result<RadioChannelStatus> RadioEngine::get_channel_status(
    const std::string& channel_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<RadioChannelStatus>::error(
            ErrorCode::NOT_FOUND,
            "Channel not found: " + channel_id
        );
    }

    RadioChannelStatus status = it->second->status;
    if (it->second->is_running.load()) {
        auto now = std::chrono::system_clock::now();
        auto uptime = std::chrono::duration_cast<std::chrono::seconds>(
            now - it->second->started_at
        ).count();
        status.uptime_seconds = static_cast<int>(uptime);
    }

    return Result<RadioChannelStatus>::ok(status);
}

std::vector<RadioChannelStatus> RadioEngine::list_channels(
    const std::string& tenant_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    std::vector<RadioChannelStatus> result;
    for (const auto& [id, state] : channels_) {
        if (!tenant_id.empty() && state->config.tenant_id != tenant_id) continue;
        result.push_back(state->status);
    }
    return result;
}

// ============================================================================
// Streaming Control
// ============================================================================

Result<std::string> RadioEngine::start_channel(const std::string& channel_id) {
    RadioChannelState* raw_state = nullptr;

    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it == channels_.end()) {
            return Result<std::string>::error(
                ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
        }

        if (it->second->is_running.load()) {
            return Result<std::string>::ok(it->second->status.stream_url);
        }

        raw_state = it->second.get();
    }

    // Create the broadcast mount so listeners can connect before the thread starts
    if (broadcaster_) {
        broadcaster_->create_mount(channel_id);
    }

    // Expose a native HTTP audio stream URL (served by RadioRoutes::handle_stream)
    std::string stream_url = "/stream/" + channel_id;

    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it == channels_.end()) {
            return Result<std::string>::error(ErrorCode::NOT_FOUND, "Channel lost");
        }
        it->second->status.stream_url = stream_url;
        it->second->status.is_live = true;
        it->second->started_at = std::chrono::system_clock::now();
        it->second->is_running.store(true);

        it->second->stream_thread = std::thread([this, channel_id]() {
            stream_thread(channel_id);
        });
    }

    // Notify via config callback
    if (config_.notification_callback) {
        Notification n;
        n.type = NotificationType::STREAM_STARTED;
        n.title = "Radio Stream Started";
        n.message = "Channel " + channel_id + " is now live";
        n.icon = "success";
        n.data["channel_id"] = channel_id;
        n.data["stream_url"] = stream_url;
        config_.notification_callback(n);
    }

    std::cout << "[RadioEngine] Started channel: " << channel_id << std::endl;
    return Result<std::string>::ok(stream_url);
}

Result<void> RadioEngine::stop_channel(const std::string& channel_id) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    if (!state->is_running.load()) {
        return Result<void>::ok();  // Already stopped
    }

    state->is_running.store(false);
    state->cv.notify_all();
    if (state->stream_thread.joinable()) {
        state->stream_thread.join();
    }

    state->status.is_live = false;
    state->status.now_playing = std::nullopt;

    std::cout << "[RadioEngine] Stopped channel: " << channel_id << std::endl;

    if (config_.notification_callback) {
        Notification n;
        n.type = NotificationType::STREAM_STOPPED;
        n.title = "Radio Stream Stopped";
        n.message = "Channel " + channel_id + " has gone offline";
        n.icon = "info";
        n.data["channel_id"] = channel_id;
        config_.notification_callback(n);
    }

    return Result<void>::ok();
}

// ============================================================================
// Playlist Management
// ============================================================================

Result<void> RadioEngine::set_playlist(
    const std::string& channel_id,
    const std::vector<RadioTrack>& tracks
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);

    state->playlist.clear();
    for (const auto& track : tracks) {
        RadioPlaylistEntry entry;
        entry.track = track;
        entry.played = false;
        state->playlist.push_back(entry);
    }
    state->current_index = 0;

    return Result<void>::ok();
}

Result<void> RadioEngine::add_track(
    const std::string& channel_id,
    const RadioTrack& track,
    int position
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);

    RadioPlaylistEntry entry;
    entry.track = track;
    entry.played = false;

    if (position < 0 || position >= static_cast<int>(state->playlist.size())) {
        state->playlist.push_back(entry);
    } else {
        state->playlist.insert(state->playlist.begin() + position, entry);
    }

    return Result<void>::ok();
}

Result<void> RadioEngine::remove_track(
    const std::string& channel_id,
    const std::string& track_id
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    std::lock_guard<std::mutex> slock(state->mutex);

    auto& playlist = state->playlist;
    auto rit = std::remove_if(playlist.begin(), playlist.end(),
        [&track_id](const RadioPlaylistEntry& e) { return e.track.id == track_id; });

    if (rit == playlist.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Track not found: " + track_id);
    }

    playlist.erase(rit, playlist.end());
    return Result<void>::ok();
}

Result<void> RadioEngine::skip_track(const std::string& channel_id) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& state = it->second;
    state->cv.notify_all();  // Wake up stream thread to skip
    return Result<void>::ok();
}

Result<std::vector<RadioPlaylistEntry>> RadioEngine::get_playlist(
    const std::string& channel_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<std::vector<RadioPlaylistEntry>>::error(
            ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    return Result<std::vector<RadioPlaylistEntry>>::ok(it->second->playlist);
}

Result<RadioTrack> RadioEngine::get_now_playing(
    const std::string& channel_id
) const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<RadioTrack>::error(
            ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    if (!it->second->status.now_playing.has_value()) {
        return Result<RadioTrack>::error(ErrorCode::NOT_FOUND, "Nothing playing");
    }

    return Result<RadioTrack>::ok(it->second->status.now_playing.value());
}

// ============================================================================
// Auto-DJ
// ============================================================================

Result<void> RadioEngine::set_auto_dj(
    const std::string& channel_id,
    bool enabled,
    const std::vector<std::string>& folders,
    bool shuffle
) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Channel not found: " + channel_id);
    }

    auto& config = it->second->config;
    config.auto_dj_enabled = enabled;
    config.auto_dj_folders = folders;
    config.shuffle = shuffle;

    if (enabled && !folders.empty()) {
        // Scan folders and populate playlist
        std::vector<RadioTrack> all_tracks;
        for (const auto& folder : folders) {
            auto tracks = scan_folder(folder);
            all_tracks.insert(all_tracks.end(), tracks.begin(), tracks.end());
        }

        if (shuffle) {
            std::random_device rd;
            std::mt19937 g(rd());
            std::shuffle(all_tracks.begin(), all_tracks.end(), g);
        }

        std::lock_guard<std::mutex> slock(it->second->mutex);
        it->second->playlist.clear();
        for (const auto& track : all_tracks) {
            RadioPlaylistEntry entry;
            entry.track = track;
            entry.played = false;
            it->second->playlist.push_back(entry);
        }
    }

    return Result<void>::ok();
}

// ============================================================================
// Statistics
// ============================================================================

void RadioEngine::update_listener_count(const std::string& channel_id, int delta) {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    auto it = channels_.find(channel_id);
    if (it == channels_.end()) return;

    it->second->listener_count.fetch_add(delta);
    it->second->status.listeners = it->second->listener_count.load();
}

int RadioEngine::get_total_listeners() const {
    std::lock_guard<std::mutex> lock(channels_mutex_);

    int total = 0;
    for (const auto& [id, state] : channels_) {
        total += state->listener_count.load();
    }
    return total;
}

// ============================================================================
// Private: Stream Thread
// ============================================================================

void RadioEngine::stream_thread(const std::string& channel_id) {
    std::cout << "[RadioEngine] Stream thread started: " << channel_id << std::endl;

    while (true) {
        RadioChannelState* state = nullptr;
        RadioChannelConfig cfg;
        RadioTrack current_track;
        bool has_track = false;

        {
            std::lock_guard<std::mutex> lock(channels_mutex_);
            auto it = channels_.find(channel_id);
            if (it == channels_.end() || !it->second->is_running.load()) break;

            state = it->second.get();
            cfg = state->config;

            // Get next track
            if (!state->playlist.empty()) {
                size_t idx = state->current_index % state->playlist.size();
                auto& entry = state->playlist[idx];
                if (!entry.played || cfg.auto_dj_enabled) {
                    current_track = entry.track;
                    entry.played = true;
                    state->current_index = (idx + 1) % state->playlist.size();
                    has_track = true;
                }
            }
        }

        if (!has_track) {
            // No tracks - wait a bit
            std::this_thread::sleep_for(std::chrono::seconds(2));

            // Check again
            {
                std::lock_guard<std::mutex> lock(channels_mutex_);
                auto it = channels_.find(channel_id);
                if (it == channels_.end() || !it->second->is_running.load()) break;
            }
            continue;
        }

        // Update now_playing
        {
            std::lock_guard<std::mutex> lock(channels_mutex_);
            auto it = channels_.find(channel_id);
            if (it == channels_.end() || !it->second->is_running.load()) break;
            it->second->status.now_playing = current_track;
        }

        // Stream via ffmpeg → pipe:1 (stdout) → broadcaster
        if (!cfg.codec.empty() && std::filesystem::exists(current_track.path)) {
            // Build ffmpeg command writing MP3 to stdout
            std::string ffmpeg_cmd = "/usr/bin/ffmpeg -re -i \""
                + current_track.path + "\"";

            // Audio normalization
            if (config_.normalization_enabled) {
                ffmpeg_cmd += " -af \"loudnorm=I="
                    + std::to_string(static_cast<int>(config_.target_lufs)) + "\"";
            }

            ffmpeg_cmd += " -c:a " + cfg.codec
                + " -b:a " + std::to_string(cfg.bitrate_kbps) + "k"
                + " -ar " + std::to_string(cfg.sample_rate)
                + " -f mp3 pipe:1"
                + " -y 2>/dev/null";

            std::cout << "[RadioEngine] Streaming track: " << current_track.title
                      << " on channel " << channel_id << std::endl;

#ifndef _WIN32
            FILE* pipe = popen(ffmpeg_cmd.c_str(), "r");
            if (pipe) {
                static constexpr size_t CHUNK = 4096;
                char buf[CHUNK];
                while (true) {
                    // Check if the channel has been stopped
                    {
                        std::lock_guard<std::mutex> lock(channels_mutex_);
                        auto it = channels_.find(channel_id);
                        if (it == channels_.end() || !it->second->is_running.load()) break;
                    }

                    size_t bytes_read = fread(buf, 1, CHUNK, pipe);
                    if (bytes_read == 0) break;  // EOF or ffmpeg exited

                    if (broadcaster_) {
                        broadcaster_->write(channel_id, buf, bytes_read);
                    }
                }
                pclose(pipe);
            } else {
                std::cerr << "[RadioEngine] Failed to popen ffmpeg for: "
                          << current_track.path << std::endl;
                std::this_thread::sleep_for(std::chrono::milliseconds(500));
            }
#else
            // Windows fallback: not currently supported for pipe streaming
            std::this_thread::sleep_for(std::chrono::seconds(1));
#endif
        } else {
            // File not found, skip
            std::cerr << "[RadioEngine] Track file not found: " << current_track.path << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
        }

        // Check if still running
        {
            std::lock_guard<std::mutex> lock(channels_mutex_);
            auto it = channels_.find(channel_id);
            if (it == channels_.end() || !it->second->is_running.load()) break;
        }

        // Crossfade: handled by ffmpeg filter above in the next iteration
    }

    // Mark channel as not live
    {
        std::lock_guard<std::mutex> lock(channels_mutex_);
        auto it = channels_.find(channel_id);
        if (it != channels_.end()) {
            it->second->status.is_live = false;
            it->second->status.now_playing = std::nullopt;
        }
    }

    // Close all connected listeners and tear down the mount
    if (broadcaster_) {
        broadcaster_->remove_mount(channel_id);
    }

    std::cout << "[RadioEngine] Stream thread stopped: " << channel_id << std::endl;
}

void RadioEngine::load_next_track(RadioChannelState& state) {
    std::lock_guard<std::mutex> slock(state.mutex);

    if (state.playlist.empty()) return;

    size_t idx = state.current_index % state.playlist.size();
    state.status.next_track = state.playlist[idx].track;
}

void RadioEngine::process_audio(RadioChannelState& /*state*/, void* /*buffer*/, size_t /*size*/) {
    // Audio processing is delegated to ffmpeg via command-line
    // This method is a placeholder for future in-process audio manipulation
}

void RadioEngine::generate_hls_segment(
    const std::string& channel_id,
    const void* /*audio_data*/,
    size_t /*size*/
) {
    // HLS segment generation is handled by ffmpeg in stream_thread
    // This method is a placeholder for in-process segment generation
    (void)channel_id;
}

std::vector<RadioTrack> RadioEngine::scan_folder(const std::string& folder) {
    std::vector<RadioTrack> tracks;

    if (!std::filesystem::exists(folder) || !std::filesystem::is_directory(folder)) {
        return tracks;
    }

    static const std::vector<std::string> audio_exts = {
        ".mp3", ".flac", ".ogg", ".wav", ".aac", ".m4a", ".opus", ".wma"
    };

    for (const auto& entry : std::filesystem::recursive_directory_iterator(folder)) {
        if (!entry.is_regular_file()) continue;

        std::string ext = entry.path().extension().string();
        std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);

        if (std::find(audio_exts.begin(), audio_exts.end(), ext) == audio_exts.end()) continue;

        RadioTrack track = get_track_metadata(entry.path().string());
        tracks.push_back(track);
    }

    return tracks;
}

RadioTrack RadioEngine::get_track_metadata(const std::string& path) {
    RadioTrack track;
    track.id = path;  // Use path as ID
    track.path = path;

    // Extract title from filename
    std::filesystem::path p(path);
    track.title = p.stem().string();

    // Use ffprobe to get metadata
    std::string cmd = "/usr/bin/ffprobe -v quiet -print_format flat"
                      " -show_entries format_tags=title,artist,album"
                      " -i \"" + path + "\" 2>/dev/null";

    char buffer[4096];
    std::string output;

    FILE* pipe = popen(cmd.c_str(), "r");
    if (pipe) {
        while (fgets(buffer, sizeof(buffer), pipe)) {
            output += buffer;
        }
        pclose(pipe);

        // Parse flat output
        auto parse_tag = [&output](const std::string& key) -> std::string {
            std::string search = "format.tags." + key + "=";
            auto pos = output.find(search);
            if (pos == std::string::npos) return "";
            pos += search.size();

            // Strip surrounding quotes
            if (output[pos] == '"') ++pos;
            auto end = output.find('\n', pos);
            std::string val = output.substr(pos, end - pos);
            if (!val.empty() && val.back() == '"') val.pop_back();
            return val;
        };

        std::string title = parse_tag("title");
        std::string artist = parse_tag("artist");
        std::string album = parse_tag("album");

        if (!title.empty()) track.title = title;
        if (!artist.empty()) track.artist = artist;
        if (!album.empty()) track.album = album;
    }

    // Get duration
    std::string dur_cmd = "/usr/bin/ffprobe -v quiet -show_entries format=duration"
                          " -print_format flat -i \"" + path + "\" 2>/dev/null";
    FILE* dur_pipe = popen(dur_cmd.c_str(), "r");
    if (dur_pipe) {
        char dbuf[256];
        if (fgets(dbuf, sizeof(dbuf), dur_pipe)) {
            std::string line(dbuf);
            auto eq = line.find('=');
            if (eq != std::string::npos) {
                try {
                    double dur = std::stod(line.substr(eq + 1));
                    track.duration_ms = static_cast<int>(dur * 1000);
                } catch (...) {}
            }
        }
        pclose(dur_pipe);
    }

    return track;
}

} // namespace media
