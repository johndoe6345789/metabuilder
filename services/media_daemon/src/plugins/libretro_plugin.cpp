#include "media/plugins/libretro_plugin.hpp"
#include "media/plugins/libretro/libretro.h"

#include <dlfcn.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <poll.h>
#include <csignal>
#include <cerrno>
#include <cstdio>
#include <cstdarg>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <chrono>
#include <cstdlib>
#include <sstream>
#include <deque>
#include <condition_variable>

namespace fs = std::filesystem;

namespace media::plugins {

// ============================================================================
// System <-> string, known core filename -> system mapping
// ============================================================================

RetroSystem retro_system_from_string(const std::string& s) {
    if (s == "nes") return RetroSystem::NES;
    if (s == "snes") return RetroSystem::SNES;
    if (s == "gb") return RetroSystem::GB;
    if (s == "gba") return RetroSystem::GBA;
    if (s == "genesis") return RetroSystem::Genesis;
    if (s == "ps1") return RetroSystem::PS1;
    if (s == "n64") return RetroSystem::N64;
    if (s == "arcade") return RetroSystem::Arcade;
    return RetroSystem::Unknown;
}

namespace {

std::string system_to_string(RetroSystem s) {
    switch (s) {
        case RetroSystem::NES: return "nes";
        case RetroSystem::SNES: return "snes";
        case RetroSystem::GB: return "gb";
        case RetroSystem::GBA: return "gba";
        case RetroSystem::Genesis: return "genesis";
        case RetroSystem::PS1: return "ps1";
        case RetroSystem::N64: return "n64";
        case RetroSystem::Arcade: return "arcade";
        default: return "unknown";
    }
}

// Known libretro core filename stems ("<stem>_libretro.so") -> RetroSystem.
// Only "fceumm" actually ships in the runtime image today (see Dockerfile);
// the rest are here so dropping a matching core .so into LIBRETRO_CORES_DIR
// (a mounted volume) picks it up on the next restart with no code change.
const std::map<std::string, RetroSystem>& known_core_systems() {
    static const std::map<std::string, RetroSystem> table = {
        {"fceumm", RetroSystem::NES},
        {"snes9x", RetroSystem::SNES},
        {"gambatte", RetroSystem::GB},
        {"mgba", RetroSystem::GBA},
        {"genesis_plus_gx", RetroSystem::Genesis},
        {"pcsx_rearmed", RetroSystem::PS1},
        {"mupen64plus_next", RetroSystem::N64},
        {"fbneo", RetroSystem::Arcade},
    };
    return table;
}

} // namespace

// ============================================================================
// SessionRuntime — everything a single running session needs. Only one of
// these is ever active at a time (see core_slot_mutex_ in the header) because
// libretro's callback ABI has no per-instance context pointer.
// ============================================================================

struct LibretroPlugin::SessionRuntime {
    std::string job_id;
    std::string session_id;
    RetroSystem system = RetroSystem::Unknown;

    void* core_handle = nullptr;
    void (*fn_retro_init)() = nullptr;
    void (*fn_retro_deinit)() = nullptr;
    unsigned (*fn_retro_api_version)() = nullptr;
    void (*fn_retro_get_system_info)(struct retro_system_info*) = nullptr;
    void (*fn_retro_get_system_av_info)(struct retro_system_av_info*) = nullptr;
    void (*fn_retro_set_environment)(retro_environment_t) = nullptr;
    void (*fn_retro_set_video_refresh)(retro_video_refresh_t) = nullptr;
    void (*fn_retro_set_audio_sample)(retro_audio_sample_t) = nullptr;
    void (*fn_retro_set_audio_sample_batch)(retro_audio_sample_batch_t) = nullptr;
    void (*fn_retro_set_input_poll)(retro_input_poll_t) = nullptr;
    void (*fn_retro_set_input_state)(retro_input_state_t) = nullptr;
    void (*fn_retro_set_controller_port_device)(unsigned, unsigned) = nullptr;
    void (*fn_retro_run)() = nullptr;
    bool (*fn_retro_load_game)(const struct retro_game_info*) = nullptr;
    void (*fn_retro_unload_game)() = nullptr;

    std::string system_directory;
    std::string saves_directory;

    unsigned fb_width = 0;
    unsigned fb_height = 0;
    int pixel_format = RETRO_PIXEL_FORMAT_0RGB1555;  // libretro default until core says otherwise
    double fps = 60.0;
    double sample_rate = 44100.0;

    int video_fifo_fd = -1;
    int audio_fifo_fd = -1;
    std::string video_fifo_path;
    std::string audio_fifo_path;
    pid_t ffmpeg_pid = -1;

    std::vector<uint8_t> rom_buffer;     // kept alive if core needs data-in-memory loading
    std::vector<uint8_t> frame_scratch;  // reused tightly-packed row buffer for video_refresh

    // video_refresh_cb/audio_sample*_cb run on the thread calling retro_run()
    // in a tight per-frame loop — they must never block. Writing straight to
    // the FIFOs from there deadlocks: ffmpeg reads its two raw inputs on its
    // own schedule, so a single frame (up to ~1MB) can fill the pipe buffer
    // and block that thread on write() while ffmpeg is meanwhile waiting to
    // read the *other* stream, which this thread never reaches because it's
    // stuck — a circular wait (confirmed live: both sides stuck in
    // pipe_write/pipe_read). Dedicated writer threads decouple production
    // (retro_run()'s thread, must stay fast) from consumption (blocking on
    // ffmpeg's pace is fine off that thread) — draining bounded,
    // drop-oldest queues so a slow reader loses freshness, not correctness.
    static constexpr size_t kMaxQueuedVideoFrames = 3;
    static constexpr size_t kMaxQueuedAudioBytes = 64 * 1024;

    std::mutex video_queue_mutex;
    std::condition_variable video_queue_cv;
    std::deque<std::vector<uint8_t>> video_queue;
    std::thread video_writer_thread;

    std::mutex audio_queue_mutex;
    std::condition_variable audio_queue_cv;
    std::deque<std::vector<uint8_t>> audio_queue;
    size_t audio_queue_bytes = 0;
    std::thread audio_writer_thread;

    std::atomic<bool> stop_writers{false};

    std::mutex input_mutex;
    std::array<std::array<bool, 16>, 2> buttons{};  // [port][RETRO_DEVICE_ID_JOYPAD_*]

    std::atomic<bool> cancel_requested{false};

    std::string hls_dir;  // /data/hls/retro/<session_id>
};

namespace {

// libretro's C callback ABI has no userdata/context parameter — a loaded
// core calls a single global set of function pointers. Guarded by
// LibretroPlugin::core_slot_mutex_ (only one session's callbacks are ever
// live at a time).
LibretroPlugin::SessionRuntime* g_active_session = nullptr;

int bytes_per_pixel(int pixel_format) {
    switch (pixel_format) {
        case RETRO_PIXEL_FORMAT_XRGB8888: return 4;
        case RETRO_PIXEL_FORMAT_RGB565:   return 2;
        case RETRO_PIXEL_FORMAT_0RGB1555:
        default:                          return 2;
    }
}

// ffmpeg rawvideo -pixel_format name for each libretro pixel format, native
// (little) endian — matches every platform this daemon builds for.
const char* ffmpeg_pix_fmt(int pixel_format) {
    switch (pixel_format) {
        case RETRO_PIXEL_FORMAT_XRGB8888: return "bgra";
        case RETRO_PIXEL_FORMAT_RGB565:   return "rgb565le";
        case RETRO_PIXEL_FORMAT_0RGB1555:
        default:                          return "rgb555le";
    }
}

void retro_log_cb(enum retro_log_level level, const char* fmt, ...) {
    const char* prefix = level >= RETRO_LOG_ERROR ? "[core:error]" :
                          level >= RETRO_LOG_WARN  ? "[core:warn]"  : "[core:info]";
    fprintf(stderr, "%s ", prefix);
    va_list args;
    va_start(args, fmt);
    vfprintf(stderr, fmt, args);
    va_end(args);
}

bool environment_cb(unsigned cmd, void* data) {
    auto* s = g_active_session;
    if (!s) return false;

    switch (cmd) {
        case RETRO_ENVIRONMENT_GET_CAN_DUPE:
            // We don't dedupe frames — always require the core to send full data.
            *static_cast<bool*>(data) = false;
            return true;

        case RETRO_ENVIRONMENT_SET_PIXEL_FORMAT: {
            auto fmt = *static_cast<const enum retro_pixel_format*>(data);
            if (fmt != RETRO_PIXEL_FORMAT_0RGB1555 && fmt != RETRO_PIXEL_FORMAT_RGB565 &&
                fmt != RETRO_PIXEL_FORMAT_XRGB8888) {
                return false;
            }
            s->pixel_format = fmt;
            return true;
        }

        case RETRO_ENVIRONMENT_GET_SYSTEM_DIRECTORY:
            *static_cast<const char**>(data) = s->system_directory.c_str();
            return true;

        case RETRO_ENVIRONMENT_GET_SAVE_DIRECTORY:
            *static_cast<const char**>(data) = s->saves_directory.c_str();
            return true;

        case RETRO_ENVIRONMENT_GET_LIBRETRO_PATH:
            // Not tracked per-session; unsupported is a valid response.
            return false;

        case RETRO_ENVIRONMENT_SET_INPUT_DESCRIPTORS:
            return true;  // acknowledged, contents ignored

        case RETRO_ENVIRONMENT_SET_VARIABLES:
            return true;  // acknowledged — no core-options support, core uses its defaults

        case RETRO_ENVIRONMENT_GET_VARIABLE:
            return false;  // "no value for this option" -> core falls back to its default

        case RETRO_ENVIRONMENT_GET_VARIABLE_UPDATE:
            *static_cast<bool*>(data) = false;
            return true;

        case RETRO_ENVIRONMENT_GET_LOG_INTERFACE:
            static_cast<struct retro_log_callback*>(data)->log = retro_log_cb;
            return true;

        case RETRO_ENVIRONMENT_SHUTDOWN:
            s->cancel_requested.store(true);
            return true;

        default:
            return false;
    }
}

void video_refresh_cb(const void* data, unsigned width, unsigned height, size_t pitch) {
    auto* s = g_active_session;
    if (!s || !data) return;

    s->fb_width = width;
    s->fb_height = height;

    const int bpp = bytes_per_pixel(s->pixel_format);
    const size_t row_bytes = static_cast<size_t>(width) * bpp;

    std::vector<uint8_t> frame(row_bytes * height);
    const auto* src = static_cast<const uint8_t*>(data);
    for (unsigned y = 0; y < height; ++y) {
        std::memcpy(frame.data() + y * row_bytes, src + y * pitch, row_bytes);
    }

    std::lock_guard<std::mutex> lock(s->video_queue_mutex);
    if (s->video_queue.size() >= LibretroPlugin::SessionRuntime::kMaxQueuedVideoFrames) {
        s->video_queue.pop_front();  // drop the oldest — freshness over completeness for a livestream
    }
    s->video_queue.push_back(std::move(frame));
    s->video_queue_cv.notify_one();
}

void enqueue_audio(LibretroPlugin::SessionRuntime* s, const int16_t* data, size_t frame_pairs) {
    if (frame_pairs == 0) return;
    std::vector<uint8_t> chunk(frame_pairs * 2 * sizeof(int16_t));
    std::memcpy(chunk.data(), data, chunk.size());

    std::lock_guard<std::mutex> lock(s->audio_queue_mutex);
    while (!s->audio_queue.empty() &&
           s->audio_queue_bytes + chunk.size() > LibretroPlugin::SessionRuntime::kMaxQueuedAudioBytes) {
        s->audio_queue_bytes -= s->audio_queue.front().size();
        s->audio_queue.pop_front();
    }
    s->audio_queue_bytes += chunk.size();
    s->audio_queue.push_back(std::move(chunk));
    s->audio_queue_cv.notify_one();
}

void audio_sample_cb(int16_t left, int16_t right) {
    auto* s = g_active_session;
    if (!s) return;
    int16_t frame[2] = {left, right};
    enqueue_audio(s, frame, 1);
}

size_t audio_sample_batch_cb(const int16_t* data, size_t frames) {
    auto* s = g_active_session;
    if (!s) return frames;
    enqueue_audio(s, data, frames);
    return frames;
}

// Writes chunk[offset..] to fifo_fd, polling with a short timeout instead of
// a plain blocking write() so a slow/stalled reader (ffmpeg) can't prevent
// this thread from noticing stop_flag — closing the fd from another thread
// does NOT reliably interrupt an in-progress blocking write() on Linux
// (confirmed live: a stuck ffmpeg left a writer thread parked in pipe_write
// long after close() ran), so stop_flag must be polled directly instead.
// Returns false if the caller should give up (stop requested, or fd error).
bool write_interruptible(int fifo_fd, const std::vector<uint8_t>& chunk, std::atomic<bool>& stop_flag) {
    size_t offset = 0;
    while (offset < chunk.size()) {
        if (stop_flag.load()) return false;
        struct pollfd pfd{fifo_fd, POLLOUT, 0};
        int pr = poll(&pfd, 1, 100 /*ms*/);
        if (pr < 0) return false;
        if (pr == 0) continue;  // timed out — loop back and recheck stop_flag
        if (pfd.revents & (POLLERR | POLLNVAL)) return false;
        ssize_t written = write(fifo_fd, chunk.data() + offset, chunk.size() - offset);
        if (written <= 0) return false;
        offset += static_cast<size_t>(written);
    }
    return true;
}

// Drains `queue` into `fifo_fd` until told to stop. Runs on its own thread so
// a blocking write() here never stalls the emulation loop or the other
// stream's writer — see the SessionRuntime queue fields' doc comment.
template <typename QueueT, typename SizeUpdateFn>
void writer_loop(std::atomic<bool>& stop_flag, std::mutex& mtx, std::condition_variable& cv,
                  QueueT& queue, int fifo_fd, SizeUpdateFn on_pop) {
    while (true) {
        std::vector<uint8_t> chunk;
        {
            std::unique_lock<std::mutex> lock(mtx);
            cv.wait_for(lock, std::chrono::milliseconds(100),
                        [&]() { return stop_flag.load() || !queue.empty(); });
            if (stop_flag.load() && queue.empty()) return;
            if (queue.empty()) continue;
            chunk = std::move(queue.front());
            queue.pop_front();
            on_pop(chunk);
        }
        if (!write_interruptible(fifo_fd, chunk, stop_flag)) return;
    }
}

void input_poll_cb() {
    // No-op: input_state_cb reads directly from the session's live button
    // array (updated by LibretroPlugin::send_input), no separate polling
    // snapshot needed for this simple single-session model.
}

int16_t input_state_cb(unsigned port, unsigned device, unsigned /*index*/, unsigned id) {
    auto* s = g_active_session;
    if (!s || device != RETRO_DEVICE_JOYPAD || port >= 2 || id >= 16) return 0;
    std::lock_guard<std::mutex> lock(s->input_mutex);
    return s->buttons[port][id] ? 1 : 0;
}

// Opens a FIFO for read+write from this process so a subsequently-exec'd
// reader (ffmpeg) never blocks waiting for a writer to show up, regardless
// of fork/exec timing — a standard Linux trick (POSIX leaves O_RDWR on a
// FIFO undefined, but Linux defines and relies on it).
int open_fifo_rdwr(const std::string& path) {
    if (mkfifo(path.c_str(), 0600) != 0 && errno != EEXIST) {
        return -1;
    }
    // O_CLOEXEC: without it, fork()+execvp() below hands ffmpeg an extra
    // inherited copy of our write-side fd. ffmpeg opens its own read-side fd
    // via -i <path>, so it never needs ours — but if it keeps one anyway,
    // the FIFO's writer refcount never reaches zero once *we* close our end,
    // so ffmpeg's reader never sees EOF and blocks forever even after
    // SIGTERM (confirmed live: ffmpeg outlived both our close() and a
    // SIGTERM sent well after the session ended).
    return ::open(path.c_str(), O_RDWR | O_CLOEXEC);
}

} // namespace

// ============================================================================
// Plugin interface
// ============================================================================

LibretroPlugin::LibretroPlugin() = default;
LibretroPlugin::~LibretroPlugin() { shutdown(); }

PluginInfo LibretroPlugin::info() const {
    return PluginInfo{
        .id = "libretro",
        .name = "Libretro Retro Gaming",
        .version = "1.0.0",
        .author = "MetaBuilder",
        .description = "Runs libretro cores (e.g. FCEUmm for NES) and streams gameplay out as HLS.",
        .type = PluginType::STREAMER,
        .supported_formats = {"nes", "rom"},
        .capabilities = {"retro_session", "hls_output"},
        .is_loaded = initialized_,
        .is_builtin = true
    };
}

PluginCapabilities LibretroPlugin::capabilities() const {
    PluginCapabilities caps;
    caps.supports_video = true;
    caps.supports_audio = true;
    caps.supports_streaming = true;
    caps.output_formats = {"hls", "m3u8"};
    return caps;
}

Result<void> LibretroPlugin::initialize(const std::string& /*config_path*/) {
    auto env_or = [](const char* name, const std::string& def) {
        const char* v = std::getenv(name);
        return (v && *v) ? std::string(v) : def;
    };

    cores_directory_ = env_or("LIBRETRO_CORES_DIR", "/data/cores");
    system_directory_ = env_or("LIBRETRO_SYSTEM_DIR", "/data/system");
    saves_directory_ = env_or("LIBRETRO_SAVES_DIR", "/data/saves");
    hls_output_dir_ = "/data/hls/retro";

    std::error_code ec;
    fs::create_directories(hls_output_dir_, ec);

    auto scan = scan_cores();
    std::cout << "[LibretroPlugin] Initialized — "
              << (scan.is_ok() ? scan.value() : 0)
              << " core(s) available under " << cores_directory_ << std::endl;

    initialized_ = true;
    return Result<void>::ok();  // non-fatal even with zero cores — matches FFmpegPlugin's degraded-mode pattern
}

void LibretroPlugin::shutdown() {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    for (auto& [id, session] : sessions_) {
        session->cancel_requested.store(true);
    }
    initialized_ = false;
}

bool LibretroPlugin::is_healthy() const {
    return initialized_;
}

bool LibretroPlugin::can_handle(JobType type, const JobParams& params) const {
    if (type != JobType::RetroSession) return false;
    return std::holds_alternative<std::map<std::string, std::string>>(params);
}

Result<int> LibretroPlugin::scan_cores() {
    cores_by_system_name_.clear();
    if (cores_directory_.empty() || !fs::exists(cores_directory_)) {
        return Result<int>::ok(0);
    }

    int found = 0;
    const std::string suffix = "_libretro.so";
    for (const auto& entry : fs::directory_iterator(cores_directory_)) {
        if (!entry.is_regular_file()) continue;
        std::string filename = entry.path().filename().string();
        if (filename.size() <= suffix.size() ||
            filename.compare(filename.size() - suffix.size(), suffix.size(), suffix) != 0) {
            continue;
        }
        std::string core_name = filename.substr(0, filename.size() - suffix.size());
        auto it = known_core_systems().find(core_name);
        if (it == known_core_systems().end()) {
            std::cout << "[LibretroPlugin] Skipping core with no known system mapping: "
                      << filename << std::endl;
            continue;
        }

        LibretroCore core;
        core.name = core_name;
        core.system = it->second;
        core.so_path = entry.path().string();
        cores_by_system_name_[system_to_string(core.system)] = core;
        ++found;
        std::cout << "[LibretroPlugin] Found core: " << core_name << " -> "
                  << system_to_string(core.system) << " (" << core.so_path << ")" << std::endl;
    }
    return Result<int>::ok(found);
}

std::vector<LibretroCore> LibretroPlugin::get_available_cores() const {
    std::vector<LibretroCore> result;
    result.reserve(cores_by_system_name_.size());
    for (const auto& [name, core] : cores_by_system_name_) result.push_back(core);
    return result;
}

Result<void> LibretroPlugin::send_input(const std::string& session_id, int player, int retro_button_id, bool pressed) {
    if (player < 0 || player >= 2 || retro_button_id < 0 || retro_button_id >= 16) {
        return Result<void>::error(ErrorCode::VALIDATION_ERROR, "player must be 0-1, button id 0-15");
    }
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    for (auto& [job_id, session] : sessions_) {
        if (session->session_id != session_id) continue;
        std::lock_guard<std::mutex> input_lock(session->input_mutex);
        session->buttons[player][retro_button_id] = pressed;
        return Result<void>::ok();
    }
    return Result<void>::error(ErrorCode::NOT_FOUND, "No active session: " + session_id);
}

Result<void> LibretroPlugin::cancel(const std::string& job_id) {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    auto it = sessions_.find(job_id);
    if (it == sessions_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "No active session for job: " + job_id);
    }
    it->second->cancel_requested.store(true);
    return Result<void>::ok();
}

Result<std::string> LibretroPlugin::process(
    const JobRequest& request,
    JobProgressCallback progress_callback
) {
    if (!initialized_) {
        return Result<std::string>::error(ErrorCode::SERVICE_UNAVAILABLE, "Libretro plugin not initialized");
    }

    // Only one core can run per process (see core_slot_mutex_ doc comment in
    // the header) — fail fast rather than corrupt a session already running.
    std::unique_lock<std::mutex> slot_lock(core_slot_mutex_, std::try_to_lock);
    if (!slot_lock.owns_lock()) {
        return Result<std::string>::error(ErrorCode::CONFLICT, "Another retro session is already active");
    }

    return run_session(request, progress_callback);
}

Result<std::string> LibretroPlugin::run_session(
    const JobRequest& request,
    JobProgressCallback progress_callback
) {
    const auto* params = std::get_if<std::map<std::string, std::string>>(&request.params);
    if (!params) {
        return Result<std::string>::error(ErrorCode::VALIDATION_ERROR, "Expected map params for RetroSession");
    }
    auto get_param = [&](const char* key) -> std::string {
        auto it = params->find(key);
        return it != params->end() ? it->second : std::string();
    };

    std::string system_str = get_param("system");
    std::string rom_path = get_param("rom_path");
    std::string session_id = get_param("session_id");
    if (system_str.empty() || rom_path.empty() || session_id.empty()) {
        return Result<std::string>::error(ErrorCode::VALIDATION_ERROR,
            "system, rom_path, and session_id are required");
    }

    RetroSystem system = retro_system_from_string(system_str);
    auto core_it = cores_by_system_name_.find(system_str);
    if (system == RetroSystem::Unknown || core_it == cores_by_system_name_.end()) {
        return Result<std::string>::error(ErrorCode::VALIDATION_ERROR,
            "No libretro core installed for system '" + system_str + "'. Available: " +
            [this]() {
                std::string s;
                for (const auto& [name, core] : cores_by_system_name_) s += name + " ";
                return s.empty() ? std::string("(none)") : s;
            }());
    }
    const LibretroCore core = core_it->second;

    if (!fs::exists(rom_path) || !fs::is_regular_file(rom_path)) {
        return Result<std::string>::error(ErrorCode::VALIDATION_ERROR, "ROM file not found: " + rom_path);
    }

    auto session = std::make_unique<SessionRuntime>();
    session->job_id = request.id;
    session->session_id = session_id;
    session->system = system;
    session->system_directory = system_directory_;
    session->saves_directory = saves_directory_;
    session->hls_dir = hls_output_dir_ + "/" + session_id;

    // Register before doing any I/O so cancel()/send_input() can find it immediately.
    {
        std::lock_guard<std::mutex> lock(sessions_mutex_);
        sessions_[session->job_id] = std::move(session);
    }
    SessionRuntime* s = sessions_[request.id].get();
    // Cleans up sessions_ + g_active_session on every exit path (error or normal).
    struct SessionGuard {
        LibretroPlugin* plugin;
        std::string job_id;
        ~SessionGuard() {
            g_active_session = nullptr;
            std::lock_guard<std::mutex> lock(plugin->sessions_mutex_);
            plugin->sessions_.erase(job_id);
        }
    } guard{this, request.id};

    if (progress_callback) {
        progress_callback(request.id, JobProgress{.percent = 5.0, .stage = "loading_core"});
    }

    s->core_handle = dlopen(core.so_path.c_str(), RTLD_NOW | RTLD_LOCAL);
    if (!s->core_handle) {
        return Result<std::string>::error(ErrorCode::PLUGIN_ERROR,
            "Failed to load core " + core.so_path + ": " + dlerror());
    }

    auto sym = [&](const char* name) -> void* {
        dlerror();
        void* p = dlsym(s->core_handle, name);
        if (!p) std::cerr << "[LibretroPlugin] Missing symbol: " << name << std::endl;
        return p;
    };

    s->fn_retro_init = reinterpret_cast<void(*)()>(sym("retro_init"));
    s->fn_retro_deinit = reinterpret_cast<void(*)()>(sym("retro_deinit"));
    s->fn_retro_api_version = reinterpret_cast<unsigned(*)()>(sym("retro_api_version"));
    s->fn_retro_get_system_info = reinterpret_cast<void(*)(struct retro_system_info*)>(sym("retro_get_system_info"));
    s->fn_retro_get_system_av_info = reinterpret_cast<void(*)(struct retro_system_av_info*)>(sym("retro_get_system_av_info"));
    s->fn_retro_set_environment = reinterpret_cast<void(*)(retro_environment_t)>(sym("retro_set_environment"));
    s->fn_retro_set_video_refresh = reinterpret_cast<void(*)(retro_video_refresh_t)>(sym("retro_set_video_refresh"));
    s->fn_retro_set_audio_sample = reinterpret_cast<void(*)(retro_audio_sample_t)>(sym("retro_set_audio_sample"));
    s->fn_retro_set_audio_sample_batch = reinterpret_cast<void(*)(retro_audio_sample_batch_t)>(sym("retro_set_audio_sample_batch"));
    s->fn_retro_set_input_poll = reinterpret_cast<void(*)(retro_input_poll_t)>(sym("retro_set_input_poll"));
    s->fn_retro_set_input_state = reinterpret_cast<void(*)(retro_input_state_t)>(sym("retro_set_input_state"));
    s->fn_retro_set_controller_port_device = reinterpret_cast<void(*)(unsigned, unsigned)>(sym("retro_set_controller_port_device"));
    s->fn_retro_run = reinterpret_cast<void(*)()>(sym("retro_run"));
    s->fn_retro_load_game = reinterpret_cast<bool(*)(const struct retro_game_info*)>(sym("retro_load_game"));
    s->fn_retro_unload_game = reinterpret_cast<void(*)()>(sym("retro_unload_game"));

    if (!s->fn_retro_init || !s->fn_retro_deinit || !s->fn_retro_get_system_info ||
        !s->fn_retro_get_system_av_info || !s->fn_retro_set_environment ||
        !s->fn_retro_set_video_refresh || !s->fn_retro_set_audio_sample ||
        !s->fn_retro_set_audio_sample_batch || !s->fn_retro_set_input_poll ||
        !s->fn_retro_set_input_state || !s->fn_retro_run || !s->fn_retro_load_game ||
        !s->fn_retro_unload_game) {
        dlclose(s->core_handle);
        s->core_handle = nullptr;
        return Result<std::string>::error(ErrorCode::PLUGIN_ERROR,
            "Core " + core.so_path + " is missing required libretro API symbols");
    }

    g_active_session = s;
    s->fn_retro_set_environment(environment_cb);
    s->fn_retro_set_video_refresh(video_refresh_cb);
    s->fn_retro_set_audio_sample(audio_sample_cb);
    s->fn_retro_set_audio_sample_batch(audio_sample_batch_cb);
    s->fn_retro_set_input_poll(input_poll_cb);
    s->fn_retro_set_input_state(input_state_cb);

    s->fn_retro_init();
    if (s->fn_retro_set_controller_port_device) {
        s->fn_retro_set_controller_port_device(0, RETRO_DEVICE_JOYPAD);
        s->fn_retro_set_controller_port_device(1, RETRO_DEVICE_JOYPAD);
    }

    struct retro_system_info sys_info{};
    s->fn_retro_get_system_info(&sys_info);

    struct retro_game_info game_info{};
    game_info.path = rom_path.c_str();
    if (sys_info.need_fullpath) {
        game_info.data = nullptr;
        game_info.size = 0;
    } else {
        std::ifstream rom(rom_path, std::ios::binary | std::ios::ate);
        if (!rom) {
            s->fn_retro_deinit();
            dlclose(s->core_handle);
            return Result<std::string>::error(ErrorCode::STORAGE_ERROR, "Failed to open ROM: " + rom_path);
        }
        auto size = rom.tellg();
        rom.seekg(0);
        s->rom_buffer.resize(static_cast<size_t>(size));
        rom.read(reinterpret_cast<char*>(s->rom_buffer.data()), size);
        game_info.data = s->rom_buffer.data();
        game_info.size = s->rom_buffer.size();
    }

    if (progress_callback) {
        progress_callback(request.id, JobProgress{.percent = 20.0, .stage = "loading_rom"});
    }

    if (!s->fn_retro_load_game(&game_info)) {
        s->fn_retro_deinit();
        dlclose(s->core_handle);
        return Result<std::string>::error(ErrorCode::PLUGIN_ERROR,
            "Core " + core.name + " rejected ROM: " + rom_path);
    }

    struct retro_system_av_info av_info{};
    s->fn_retro_get_system_av_info(&av_info);
    s->fb_width = av_info.geometry.base_width;
    s->fb_height = av_info.geometry.base_height;
    s->fps = av_info.timing.fps > 0 ? av_info.timing.fps : 60.0;
    s->sample_rate = av_info.timing.sample_rate > 0 ? av_info.timing.sample_rate : 44100.0;

    // --- AV pipeline: two FIFOs (raw video, raw PCM audio) -> ffmpeg -> HLS ---
    std::error_code ec;
    fs::create_directories(s->hls_dir, ec);
    if (ec) {
        s->fn_retro_unload_game();
        s->fn_retro_deinit();
        dlclose(s->core_handle);
        return Result<std::string>::error(ErrorCode::STORAGE_ERROR, "Failed to create " + s->hls_dir);
    }

    s->video_fifo_path = "/tmp/retro_" + request.id + "_video.raw";
    s->audio_fifo_path = "/tmp/retro_" + request.id + "_audio.raw";
    s->video_fifo_fd = open_fifo_rdwr(s->video_fifo_path);
    s->audio_fifo_fd = open_fifo_rdwr(s->audio_fifo_path);
    if (s->video_fifo_fd < 0 || s->audio_fifo_fd < 0) {
        s->fn_retro_unload_game();
        s->fn_retro_deinit();
        dlclose(s->core_handle);
        return Result<std::string>::error(ErrorCode::STORAGE_ERROR, "Failed to create session FIFOs");
    }

    std::ostringstream video_size;
    video_size << s->fb_width << "x" << s->fb_height;
    std::ostringstream framerate;
    framerate << s->fps;
    std::ostringstream sample_rate_str;
    sample_rate_str << static_cast<int>(s->sample_rate);

    std::vector<std::string> args = {
        "ffmpeg", "-hide_banner", "-loglevel", "warning",
        // Default thread_queue_size (8 packets) is too small for how bursty
        // libretro's per-frame callbacks are (a whole video frame, or many
        // small audio batches, arrive at once) — ffmpeg logs a warning and
        // its internal demuxer thread stalls without headroom here.
        "-thread_queue_size", "512",
        "-f", "rawvideo", "-pixel_format", ffmpeg_pix_fmt(s->pixel_format),
        "-video_size", video_size.str(), "-framerate", framerate.str(), "-i", s->video_fifo_path,
        "-thread_queue_size", "512",
        "-f", "s16le", "-ar", sample_rate_str.str(), "-ac", "2", "-i", s->audio_fifo_path,
        "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-hls_time", "2", "-hls_list_size", "6", "-hls_flags", "delete_segments+append_list",
        "-hls_segment_filename", s->hls_dir + "/seg_%05d.ts",
        "-y", s->hls_dir + "/index.m3u8"
    };

    pid_t pid = fork();
    if (pid == 0) {
        // Child: exec ffmpeg. std::vector<char*> argv must outlive execvp, which
        // is fine here since we never return from this branch either way.
        std::vector<char*> argv;
        argv.reserve(args.size() + 1);
        for (auto& a : args) argv.push_back(a.data());
        argv.push_back(nullptr);
        execvp("ffmpeg", argv.data());
        _exit(127);  // only reached if exec failed
    } else if (pid < 0) {
        close(s->video_fifo_fd);
        close(s->audio_fifo_fd);
        s->fn_retro_unload_game();
        s->fn_retro_deinit();
        dlclose(s->core_handle);
        return Result<std::string>::error(ErrorCode::INTERNAL_ERROR, "fork() failed for ffmpeg");
    }
    s->ffmpeg_pid = pid;

    s->video_writer_thread = std::thread([s]() {
        writer_loop(s->stop_writers, s->video_queue_mutex, s->video_queue_cv, s->video_queue,
                    s->video_fifo_fd, [](const std::vector<uint8_t>&) {});
    });
    s->audio_writer_thread = std::thread([s]() {
        writer_loop(s->stop_writers, s->audio_queue_mutex, s->audio_queue_cv, s->audio_queue,
                    s->audio_fifo_fd, [s](const std::vector<uint8_t>& chunk) {
                        s->audio_queue_bytes -= chunk.size();
                    });
    });

    if (progress_callback) {
        progress_callback(request.id, JobProgress{.percent = 30.0, .stage = "streaming"});
    }

    // --- Run loop: paced to the core's reported fps, polls cancel_requested_ ---
    using clock = std::chrono::steady_clock;
    auto frame_period = std::chrono::duration<double>(1.0 / s->fps);
    auto next_frame = clock::now();
    uint64_t frame_count = 0;

    while (!s->cancel_requested.load()) {
        s->fn_retro_run();
        ++frame_count;

        if (frame_count % static_cast<uint64_t>(s->fps) == 0 && progress_callback) {
            progress_callback(request.id, JobProgress{
                .percent = 30.0, .stage = "streaming (frame " + std::to_string(frame_count) + ")"
            });
        }

        next_frame += std::chrono::duration_cast<clock::duration>(frame_period);
        auto now = clock::now();
        if (next_frame > now) {
            std::this_thread::sleep_until(next_frame);
        } else {
            next_frame = now;  // fell behind (e.g. slow host) — resync rather than try to catch up
        }

        // ffmpeg exiting on its own (crash, bad args) ends the session too.
        int wstatus = 0;
        if (waitpid(s->ffmpeg_pid, &wstatus, WNOHANG) == s->ffmpeg_pid) {
            std::cerr << "[LibretroPlugin] ffmpeg exited unexpectedly for session "
                      << s->session_id << std::endl;
            break;
        }
    }

    // --- Teardown ---
    s->fn_retro_unload_game();
    s->fn_retro_deinit();
    dlclose(s->core_handle);
    s->core_handle = nullptr;

    // Stop the writer threads: stop_flag + notify wakes an idle writer, and
    // write_interruptible() polls stop_flag with a bounded timeout instead
    // of a plain blocking write(), so this join() returns within ~100ms
    // regardless of whether the reader (ffmpeg) is still consuming.
    s->stop_writers.store(true);
    s->video_queue_cv.notify_all();
    s->audio_queue_cv.notify_all();
    if (s->video_writer_thread.joinable()) s->video_writer_thread.join();
    if (s->audio_writer_thread.joinable()) s->audio_writer_thread.join();
    close(s->video_fifo_fd);
    close(s->audio_fifo_fd);
    ::unlink(s->video_fifo_path.c_str());
    ::unlink(s->audio_fifo_path.c_str());

    if (s->ffmpeg_pid > 0) {
        int wstatus = 0;
        if (waitpid(s->ffmpeg_pid, &wstatus, WNOHANG) != s->ffmpeg_pid) {
            kill(s->ffmpeg_pid, SIGTERM);
            waitpid(s->ffmpeg_pid, &wstatus, 0);
        }
    }

    if (progress_callback) {
        progress_callback(request.id, JobProgress{.percent = 100.0, .stage = "stopped"});
    }

    return Result<std::string>::ok(s->hls_dir + "/index.m3u8");
}

} // namespace media::plugins
