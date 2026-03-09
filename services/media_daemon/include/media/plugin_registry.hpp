/**
 * @file plugin_registry.hpp
 * @brief Central registry of all available plugins
 * 
 * Plugins are the core extensibility mechanism of the media daemon.
 * Each plugin handles specific job types and can be loaded dynamically.
 */

#pragma once

#include "media/plugin.hpp"
#include <memory>
#include <vector>
#include <functional>

namespace media {

/**
 * @brief Plugin factory function type
 */
using PluginFactory = std::function<std::unique_ptr<Plugin>()>;

/**
 * @brief Plugin metadata for registry
 */
struct PluginInfo {
    std::string name;
    std::string version;
    std::string description;
    std::vector<JobType> job_types;
    PluginFactory factory;
    bool is_builtin = false;     ///< Built-in plugins vs dynamically loaded
    std::string library_path;    ///< Path to .so/.dll for dynamic plugins
};

/**
 * @brief Central plugin registry
 * 
 * Manages discovery, loading, and lifecycle of all plugins.
 * Supports both built-in plugins (compiled in) and dynamic plugins (.so/.dll).
 */
class PluginRegistry {
public:
    static PluginRegistry& instance() {
        static PluginRegistry registry;
        return registry;
    }
    
    /**
     * @brief Register a built-in plugin factory
     */
    void register_builtin(const PluginInfo& info);
    
    /**
     * @brief Scan directory for dynamic plugins
     */
    auto scan_plugins(const std::string& directory) -> Result<int>;
    
    /**
     * @brief Load a specific plugin by name
     */
    auto load_plugin(const std::string& name) -> Result<Plugin*>;
    
    /**
     * @brief Unload a plugin
     */
    auto unload_plugin(const std::string& name) -> Result<void>;
    
    /**
     * @brief Get plugin that can handle a job type
     */
    auto get_plugin_for_job(JobType type) -> Plugin*;
    
    /**
     * @brief Get all loaded plugins
     */
    auto get_loaded_plugins() -> std::vector<Plugin*>;
    
    /**
     * @brief Get info about all registered plugins
     */
    auto get_registered_plugins() -> std::vector<PluginInfo>;
    
    /**
     * @brief Initialize all loaded plugins
     */
    auto initialize_all(const nlohmann::json& config) -> Result<void>;
    
    /**
     * @brief Shutdown all plugins
     */
    auto shutdown_all() -> Result<void>;
    
private:
    PluginRegistry() = default;
    
    std::map<std::string, PluginInfo> registered_;
    std::map<std::string, std::unique_ptr<Plugin>> loaded_;
    std::map<std::string, void*> handles_;  ///< Dynamic library handles
    std::mutex mutex_;
};

/**
 * @brief Helper macro to auto-register built-in plugins
 */
#define REGISTER_BUILTIN_PLUGIN(PluginClass) \
    namespace { \
        struct PluginClass##Registrar { \
            PluginClass##Registrar() { \
                auto plugin = std::make_unique<PluginClass>(); \
                PluginInfo info; \
                info.name = plugin->name(); \
                info.version = plugin->version(); \
                info.description = plugin->description(); \
                info.job_types = plugin->supported_job_types(); \
                info.is_builtin = true; \
                info.factory = []() { return std::make_unique<PluginClass>(); }; \
                PluginRegistry::instance().register_builtin(info); \
            } \
        }; \
        static PluginClass##Registrar s_##PluginClass##_registrar; \
    }

// ============================================================================
// Built-in Plugin List
// ============================================================================

/**
 * Available built-in plugins:
 * 
 * Media Processing:
 * - ffmpeg      : Video/audio transcoding via FFmpeg
 * - imagemagick : Image processing and conversion
 * - pandoc      : Document conversion (markdown, HTML, LaTeX → PDF, DOCX, EPUB)
 * 
 * Streaming:
 * - radio       : Internet radio station streaming with auto-DJ
 * - tv          : TV channel broadcast with EPG and scheduling
 * 
 * Gaming:
 * - libretro    : RetroArch/libretro integration for retro gaming
 * 
 * To add a new plugin:
 * 1. Create header in include/media/plugins/
 * 2. Create implementation in src/plugins/
 * 3. Add REGISTER_BUILTIN_PLUGIN(YourPlugin) in the .cpp file
 * 4. Or for dynamic loading, compile as shared library with MEDIA_PLUGIN_EXPORT
 */

} // namespace media
