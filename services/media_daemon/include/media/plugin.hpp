#pragma once

#include "media/types.hpp"
#include <memory>
#include <string>

namespace media {

/**
 * Plugin Interface
 * 
 * Base class for all media processing plugins. Plugins are loaded dynamically
 * and can handle various media processing tasks.
 * 
 * To create a custom plugin:
 * 1. Inherit from Plugin
 * 2. Implement all pure virtual methods
 * 3. Export the create_plugin() and destroy_plugin() functions
 */
class Plugin {
public:
    virtual ~Plugin() = default;
    
    // ========================================================================
    // Plugin Metadata
    // ========================================================================
    
    /**
     * Get plugin information
     */
    virtual PluginInfo info() const = 0;
    
    /**
     * Get plugin capabilities
     */
    virtual PluginCapabilities capabilities() const = 0;
    
    // ========================================================================
    // Lifecycle
    // ========================================================================
    
    /**
     * Initialize the plugin
     * Called once when the plugin is loaded
     * @param config_path Path to plugin-specific configuration
     * @return Result indicating success or failure
     */
    virtual Result<void> initialize(const std::string& config_path) = 0;
    
    /**
     * Shutdown the plugin
     * Called before the plugin is unloaded
     */
    virtual void shutdown() = 0;
    
    /**
     * Check if the plugin is healthy
     * @return true if plugin is operational
     */
    virtual bool is_healthy() const = 0;
    
    // ========================================================================
    // Processing
    // ========================================================================
    
    /**
     * Check if this plugin can handle a specific job
     * @param type Job type
     * @param params Job parameters
     * @return true if plugin can process this job
     */
    virtual bool can_handle(JobType type, const JobParams& params) const = 0;
    
    /**
     * Process a job
     * @param request Job request with all parameters
     * @param progress_callback Callback for progress updates
     * @return Result with output path or error
     */
    virtual Result<std::string> process(
        const JobRequest& request,
        JobProgressCallback progress_callback
    ) = 0;
    
    /**
     * Cancel an ongoing job
     * @param job_id ID of job to cancel
     * @return Result indicating success or failure
     */
    virtual Result<void> cancel(const std::string& job_id) = 0;
    
    // ========================================================================
    // Streaming (optional - for streaming-capable plugins)
    // ========================================================================
    
    /**
     * Start a stream
     * @param channel_id Channel ID
     * @param source Source configuration
     * @param output Output configuration
     * @return Result with stream URL or error
     */
    virtual Result<std::string> start_stream(
        const std::string& channel_id,
        const std::map<std::string, std::string>& source,
        const std::map<std::string, std::string>& output
    ) {
        return Result<std::string>::error(
            ErrorCode::NOT_FOUND,
            "Streaming not supported by this plugin"
        );
    }
    
    /**
     * Stop a stream
     * @param channel_id Channel ID
     * @return Result indicating success or failure
     */
    virtual Result<void> stop_stream(const std::string& channel_id) {
        return Result<void>::error(
            ErrorCode::NOT_FOUND,
            "Streaming not supported by this plugin"
        );
    }
};

/**
 * Plugin factory function type
 * Every plugin shared library must export these functions:
 * 
 * extern "C" {
 *     Plugin* create_plugin();
 *     void destroy_plugin(Plugin* plugin);
 *     const char* plugin_api_version();
 * }
 */
using CreatePluginFunc = Plugin* (*)();
using DestroyPluginFunc = void (*)(Plugin*);
using PluginApiVersionFunc = const char* (*)();

// Current plugin API version
constexpr const char* PLUGIN_API_VERSION = "1.0.0";

/**
 * Plugin handle for managing loaded plugins
 */
struct PluginHandle {
    std::string path;
    void* library_handle = nullptr;
    Plugin* instance = nullptr;
    CreatePluginFunc create_func = nullptr;
    DestroyPluginFunc destroy_func = nullptr;
    PluginApiVersionFunc version_func = nullptr;
    bool is_loaded = false;
};

} // namespace media

// ============================================================================
// Plugin Export Macros
// ============================================================================

/**
 * Use this macro in your plugin implementation to export required functions
 * 
 * Example:
 * 
 * class MyPlugin : public media::Plugin {
 *     // ... implementation
 * };
 * 
 * MEDIA_PLUGIN_EXPORT(MyPlugin)
 */
#ifdef _WIN32
    #define MEDIA_PLUGIN_API __declspec(dllexport)
#else
    #define MEDIA_PLUGIN_API __attribute__((visibility("default")))
#endif

#define MEDIA_PLUGIN_EXPORT(PluginClass) \
    extern "C" { \
        MEDIA_PLUGIN_API media::Plugin* create_plugin() { \
            return new PluginClass(); \
        } \
        MEDIA_PLUGIN_API void destroy_plugin(media::Plugin* plugin) { \
            delete plugin; \
        } \
        MEDIA_PLUGIN_API const char* plugin_api_version() { \
            return media::PLUGIN_API_VERSION; \
        } \
    }
