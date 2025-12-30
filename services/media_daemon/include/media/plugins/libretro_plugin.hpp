/**
 * @file libretro_plugin.hpp
 * @brief Libretro/RetroArch integration plugin for retro gaming
 * 
 * Enables running retro games via libretro cores with video/audio
 * capture for streaming, recording, or cloud gaming.
 */

#pragma once

#include "media/plugin.hpp"
#include <vector>
#include <memory>
#include <atomic>
#include <thread>
#include <functional>
#include <deque>

namespace media::plugins {

/**
 * @brief Supported libretro core systems
 */
enum class RetroSystem {
    // Nintendo
    NES,            ///< Nintendo Entertainment System (FCEUmm, Nestopia)
    SNES,           ///< Super Nintendo (Snes9x, bsnes)
    N64,            ///< Nintendo 64 (Mupen64Plus, ParaLLEl)
    GB,             ///< Game Boy (Gambatte, SameBoy)
    GBC,            ///< Game Boy Color
    GBA,            ///< Game Boy Advance (mGBA, VBA-M)
    NDS,            ///< Nintendo DS (DeSmuME, melonDS)
    VB,             ///< Virtual Boy (Beetle VB)
    
    // Sega
    MasterSystem,   ///< Sega Master System (Genesis Plus GX)
    Genesis,        ///< Sega Genesis/Mega Drive
    SegaCD,         ///< Sega CD
    Saturn,         ///< Sega Saturn (Beetle Saturn, Yabause)
    Dreamcast,      ///< Sega Dreamcast (Flycast)
    GameGear,       ///< Sega Game Gear
    
    // Sony
    PS1,            ///< PlayStation (Beetle PSX, PCSX ReARMed)
    PSP,            ///< PlayStation Portable (PPSSPP)
    
    // Atari
    Atari2600,      ///< Atari 2600 (Stella)
    Atari7800,      ///< Atari 7800 (ProSystem)
    AtariLynx,      ///< Atari Lynx (Handy)
    AtariJaguar,    ///< Atari Jaguar (Virtual Jaguar)
    
    // Other
    PCEngine,       ///< PC Engine/TurboGrafx-16 (Beetle PCE)
    NeoGeo,         ///< Neo Geo (FinalBurn Neo)
    Arcade,         ///< Arcade (MAME, FinalBurn Neo)
    DOS,            ///< DOS (DOSBox)
    ScummVM,        ///< ScummVM adventure games
    
    // Computers
    MSX,            ///< MSX (blueMSX, fMSX)
    Amiga,          ///< Amiga (PUAE)
    C64,            ///< Commodore 64 (VICE)
    ZXSpectrum,     ///< ZX Spectrum (Fuse)
    
    Custom          ///< User-specified core
};

/**
 * @brief Libretro core information
 */
struct LibretroCore {
    std::string name;           ///< Core name (e.g., "snes9x")
    std::string display_name;   ///< Display name (e.g., "Snes9x")
    std::string path;           ///< Path to .dll/.so/.dylib
    std::string version;
    RetroSystem system = RetroSystem::Custom;
    
    std::vector<std::string> supported_extensions;
    bool supports_save_states = true;
    bool supports_cheats = true;
    bool supports_achievements = false;  ///< RetroAchievements
    
    // Core options
    std::map<std::string, std::string> default_options;
};

/**
 * @brief Input device types
 */
enum class RetroInputDevice {
    None,
    Joypad,         ///< Standard controller
    Mouse,
    Keyboard,
    Lightgun,
    Analog,         ///< Analog controller (DualShock)
    Pointer,        ///< Touch/pointer device
    Multitap        ///< Multi-player adapter
};

/**
 * @brief Controller button mapping
 */
struct RetroInputMapping {
    int player = 0;
    RetroInputDevice device = RetroInputDevice::Joypad;
    
    // Button mappings (key code -> retro button)
    std::map<int, int> button_map;
    
    // Axis mappings for analog
    std::map<int, std::pair<int, int>> axis_map;  ///< axis -> (retro_axis, multiplier)
};

/**
 * @brief Game session configuration
 */
struct RetroSessionConfig {
    std::string session_id;
    std::string rom_path;
    std::string core_name;          ///< Core to use
    
    // Video output
    int output_width = 1280;
    int output_height = 720;
    int output_fps = 60;
    std::string pixel_format = "rgb565";
    bool integer_scaling = true;    ///< Pixel-perfect scaling
    std::string shader_preset;      ///< RetroArch shader preset
    
    // Audio output
    int audio_sample_rate = 48000;
    bool audio_sync = true;
    float audio_volume = 1.0f;
    
    // Save data
    std::string save_directory;
    std::string state_directory;
    bool auto_save = true;
    int auto_save_interval_sec = 60;
    
    // Core options override
    std::map<std::string, std::string> core_options;
    
    // Input
    std::vector<RetroInputMapping> input_mappings;
    
    // Streaming/recording
    bool stream_output = false;
    std::string stream_url;         ///< RTMP URL for streaming
    bool record_output = false;
    std::string record_path;
    
    // Netplay
    bool netplay_enabled = false;
    bool netplay_host = false;
    std::string netplay_server;
    int netplay_port = 55435;
    std::string netplay_password;
    
    // Cheats
    std::vector<std::string> cheat_codes;
    
    // RetroAchievements
    bool achievements_enabled = false;
    std::string ra_username;
    std::string ra_token;
    bool achievements_hardcore = false;
};

/**
 * @brief Save state metadata
 */
struct RetroSaveState {
    std::string state_id;
    std::string session_id;
    std::string path;
    std::chrono::system_clock::time_point created_at;
    std::string screenshot_path;
    std::string description;
    bool is_auto_save = false;
    int slot = 0;
};

/**
 * @brief Achievement unlock info
 */
struct RetroAchievement {
    int id;
    std::string title;
    std::string description;
    std::string badge_url;
    int points;
    bool unlocked = false;
    std::chrono::system_clock::time_point unlock_time;
    bool hardcore = false;
};

/**
 * @brief Game session runtime state
 */
struct RetroSessionState {
    std::string session_id;
    bool is_running = false;
    bool is_paused = false;
    
    std::string rom_name;
    std::string core_name;
    RetroSystem system;
    
    // Timing
    double fps = 0.0;
    double frame_time_ms = 0.0;
    uint64_t frame_count = 0;
    std::chrono::seconds play_time{0};
    
    // Performance
    float cpu_usage_percent = 0.0f;
    int audio_buffer_level = 0;
    bool fast_forward = false;
    bool slow_motion = false;
    float speed_multiplier = 1.0f;
    
    // Netplay
    bool netplay_connected = false;
    int netplay_player_count = 0;
    int netplay_ping_ms = 0;
    
    // Last screenshot
    std::string last_screenshot_path;
};

/**
 * @brief Libretro integration plugin
 * 
 * Provides retro gaming capabilities via libretro cores:
 * - Load and run any libretro core
 * - Video capture for streaming/recording
 * - Save states and battery saves
 * - Netplay support
 * - RetroAchievements integration
 * - Shader support (CRT, scanlines, etc.)
 * - Input mapping for multiple players
 */
class LibretroPlugin : public Plugin {
public:
    LibretroPlugin();
    ~LibretroPlugin() override;
    
    // Plugin interface
    auto name() const -> std::string override { return "libretro"; }
    auto version() const -> std::string override { return "1.0.0"; }
    auto description() const -> std::string override {
        return "Libretro/RetroArch integration for retro gaming with streaming support";
    }
    
    auto initialize(const nlohmann::json& config) -> Result<void> override;
    auto shutdown() -> Result<void> override;
    
    auto can_handle(JobType type) const -> bool override;
    auto process(const Job& job, ProgressCallback on_progress) -> Result<nlohmann::json> override;
    auto cancel(const std::string& job_id) -> Result<void> override;
    
    auto supported_job_types() const -> std::vector<JobType> override {
        return { JobType::Custom };  // Uses custom job type "retro_game"
    }
    
    // Core management
    auto scan_cores(const std::string& directory) -> Result<int>;
    auto get_available_cores() -> std::vector<LibretroCore>;
    auto get_core_for_rom(const std::string& rom_path) -> Result<LibretroCore>;
    auto download_core(const std::string& core_name, RetroSystem system) -> Result<std::string>;
    auto get_core_info(const std::string& core_name) -> Result<LibretroCore>;
    
    // Session management
    auto start_session(const RetroSessionConfig& config) -> Result<std::string>;
    auto stop_session(const std::string& session_id) -> Result<void>;
    auto pause_session(const std::string& session_id) -> Result<void>;
    auto resume_session(const std::string& session_id) -> Result<void>;
    auto get_session_state(const std::string& session_id) -> Result<RetroSessionState>;
    auto list_active_sessions() -> std::vector<RetroSessionState>;
    
    // Save states
    auto save_state(const std::string& session_id, int slot = -1, 
                   const std::string& description = "") -> Result<RetroSaveState>;
    auto load_state(const std::string& session_id, int slot) -> Result<void>;
    auto load_state_file(const std::string& session_id, const std::string& path) -> Result<void>;
    auto list_save_states(const std::string& session_id) -> std::vector<RetroSaveState>;
    auto delete_save_state(const std::string& state_id) -> Result<void>;
    
    // Input handling
    auto send_input(const std::string& session_id, int player, int button, bool pressed) -> Result<void>;
    auto send_analog_input(const std::string& session_id, int player, int axis, float value) -> Result<void>;
    auto update_input_mapping(const std::string& session_id, const RetroInputMapping& mapping) -> Result<void>;
    
    // Video/Audio capture
    auto take_screenshot(const std::string& session_id) -> Result<std::string>;
    auto start_recording(const std::string& session_id, const std::string& output_path) -> Result<void>;
    auto stop_recording(const std::string& session_id) -> Result<std::string>;
    auto start_streaming(const std::string& session_id, const std::string& rtmp_url) -> Result<void>;
    auto stop_streaming(const std::string& session_id) -> Result<void>;
    
    // Cheats
    auto load_cheats(const std::string& session_id, const std::vector<std::string>& codes) -> Result<void>;
    auto enable_cheat(const std::string& session_id, int index, bool enabled) -> Result<void>;
    auto clear_cheats(const std::string& session_id) -> Result<void>;
    
    // Speed control
    auto set_speed(const std::string& session_id, float multiplier) -> Result<void>;
    auto toggle_fast_forward(const std::string& session_id, bool enabled) -> Result<void>;
    auto frame_advance(const std::string& session_id) -> Result<void>;
    
    // Shaders
    auto list_shader_presets() -> std::vector<std::string>;
    auto set_shader(const std::string& session_id, const std::string& preset) -> Result<void>;
    
    // RetroAchievements
    auto login_retroachievements(const std::string& username, const std::string& password) -> Result<std::string>;
    auto get_achievements(const std::string& session_id) -> Result<std::vector<RetroAchievement>>;
    auto get_achievement_progress(const std::string& session_id) -> Result<nlohmann::json>;
    
    // Netplay
    auto host_netplay(const std::string& session_id, int port, const std::string& password = "") -> Result<std::string>;
    auto join_netplay(const std::string& session_id, const std::string& host, int port, 
                     const std::string& password = "") -> Result<void>;
    auto disconnect_netplay(const std::string& session_id) -> Result<void>;
    auto send_netplay_chat(const std::string& session_id, const std::string& message) -> Result<void>;
    
private:
    struct SessionRuntime;
    std::map<std::string, std::unique_ptr<SessionRuntime>> sessions_;
    std::mutex sessions_mutex_;
    
    std::map<std::string, LibretroCore> cores_;
    std::string cores_directory_;
    std::string system_directory_;
    std::string saves_directory_;
    
    // Libretro callbacks (static for C API)
    static void retro_video_refresh(const void* data, unsigned width, unsigned height, size_t pitch);
    static void retro_audio_sample(int16_t left, int16_t right);
    static size_t retro_audio_sample_batch(const int16_t* data, size_t frames);
    static void retro_input_poll();
    static int16_t retro_input_state(unsigned port, unsigned device, unsigned index, unsigned id);
    static bool retro_environment(unsigned cmd, void* data);
    static void retro_log(enum retro_log_level level, const char* fmt, ...);
    
    auto load_core(const std::string& path) -> Result<void*>;
    auto unload_core(void* handle) -> void;
    void run_frame(SessionRuntime& session);
    void encode_frame(SessionRuntime& session);
    void session_loop(const std::string& session_id);
};

/**
 * @brief Retro log levels (matches libretro)
 */
enum retro_log_level {
    RETRO_LOG_DEBUG = 0,
    RETRO_LOG_INFO,
    RETRO_LOG_WARN,
    RETRO_LOG_ERROR
};

} // namespace media::plugins

MEDIA_PLUGIN_EXPORT(media::plugins::LibretroPlugin)
