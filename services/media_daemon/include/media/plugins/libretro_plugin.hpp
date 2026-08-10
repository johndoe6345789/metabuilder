/**
 * @file libretro_plugin.hpp
 * @brief Libretro core integration: loads a libretro core .so, drives its
 *        retro_run() loop, and pipes the resulting video/audio into ffmpeg
 *        to produce an HLS stream at /data/hls/retro/<session_id>/index.m3u8.
 *
 * Scope: session lifecycle (start/stop) + input, one core per system. No
 * save states, cheats, netplay, achievements, or shaders yet — those need
 * their own libretro environment-callback plumbing and are real follow-up
 * work, not declared here until implemented.
 */

#pragma once

#include "media/plugin.hpp"
#include <map>
#include <memory>
#include <mutex>
#include <atomic>
#include <thread>
#include <array>

namespace media::plugins {

/// Systems the frontend's SystemPicker offers (see frontends/nextjs's
/// SystemPicker.tsx) — only ones with a core actually present under
/// LIBRETRO_CORES_DIR are usable; the rest fail process() with a clear error.
enum class RetroSystem {
    NES,
    SNES,
    GB,
    GBA,
    Genesis,
    PS1,
    N64,
    Arcade,
    Unknown,
};

RetroSystem retro_system_from_string(const std::string& s);

struct LibretroCore {
    std::string name;          // e.g. "fceumm"
    RetroSystem system;
    std::string so_path;       // e.g. /data/cores/fceumm_libretro.so
};

class LibretroPlugin : public Plugin {
public:
    LibretroPlugin();
    ~LibretroPlugin() override;

    PluginInfo info() const override;
    PluginCapabilities capabilities() const override;

    Result<void> initialize(const std::string& config_path) override;
    void shutdown() override;
    bool is_healthy() const override;

    bool can_handle(JobType type, const JobParams& params) const override;

    Result<std::string> process(
        const JobRequest& request,
        JobProgressCallback progress_callback
    ) override;

    Result<void> cancel(const std::string& job_id) override;

    // ------------------------------------------------------------------
    // Core management
    // ------------------------------------------------------------------

    /// Scans cores_directory_ for "<name>_libretro.so" files and maps each
    /// to a RetroSystem via a small known-core-name table (see .cpp).
    Result<int> scan_cores();
    std::vector<LibretroCore> get_available_cores() const;

    // ------------------------------------------------------------------
    // Input — called from RetroRoutes::handle_send_input, which looks this
    // plugin instance up via PluginManager::get_plugin("libretro") since
    // JobQueue has no path back into a plugin once process() is running.
    // ------------------------------------------------------------------

    Result<void> send_input(const std::string& session_id, int player, int retro_button_id, bool pressed);

    // Public so the free-function libretro callbacks in libretro_plugin.cpp's
    // anonymous namespace (which aren't members/friends of this class — the
    // libretro ABI takes no userdata pointer, so they must reach state via a
    // global LibretroPlugin::SessionRuntime*) can name the type.
    struct SessionRuntime;

private:
    Result<std::string> run_session(
        const JobRequest& request,
        JobProgressCallback progress_callback
    );

    std::string cores_directory_;
    std::string system_directory_;
    std::string saves_directory_;
    std::string hls_output_dir_;   // /data/hls/retro
    bool initialized_ = false;

    std::map<std::string, LibretroCore> cores_by_system_name_;  // "nes" -> core

    // libretro's C callback ABI (retro_video_refresh_t etc.) takes no
    // userdata/context pointer — a loaded core calls one global set of
    // function pointers. That means only one core can be active per process
    // at a time (true of every real libretro frontend, e.g. RetroArch, not a
    // shortcut taken here). This mutex is held for a session's entire
    // lifetime; a second concurrent session request fails fast with CONFLICT
    // rather than corrupting the first session's state.
    std::mutex core_slot_mutex_;

    std::mutex sessions_mutex_;
    std::map<std::string, std::unique_ptr<SessionRuntime>> sessions_;  // job_id -> runtime
};

} // namespace media::plugins
