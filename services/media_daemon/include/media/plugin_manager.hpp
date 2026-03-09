#pragma once

#include "media/types.hpp"
#include "media/plugin.hpp"
#include <memory>
#include <vector>
#include <map>
#include <mutex>
#include <filesystem>

namespace media {

/**
 * Plugin Manager
 * 
 * Handles loading, unloading, and managing media processing plugins.
 * Supports both built-in and dynamically loaded plugins.
 */
class PluginManager {
public:
    PluginManager();
    ~PluginManager();
    
    // Disable copying
    PluginManager(const PluginManager&) = delete;
    PluginManager& operator=(const PluginManager&) = delete;
    
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /**
     * Initialize the plugin manager
     * @param plugin_dir Directory to scan for plugins
     * @param config_path Path to plugin configuration
     * @return Result indicating success or failure
     */
    Result<void> initialize(
        const std::string& plugin_dir,
        const std::string& config_path
    );
    
    /**
     * Shutdown all plugins and cleanup
     */
    void shutdown();
    
    // ========================================================================
    // Plugin Management
    // ========================================================================
    
    /**
     * Load a specific plugin
     * @param path Path to plugin shared library
     * @return Result with plugin info or error
     */
    Result<PluginInfo> load_plugin(const std::string& path);
    
    /**
     * Unload a specific plugin
     * @param plugin_id Plugin ID to unload
     * @return Result indicating success or failure
     */
    Result<void> unload_plugin(const std::string& plugin_id);
    
    /**
     * Reload a plugin (hot-reload for development)
     * @param plugin_id Plugin ID to reload
     * @return Result with updated plugin info or error
     */
    Result<PluginInfo> reload_plugin(const std::string& plugin_id);
    
    /**
     * Get list of all loaded plugins
     * @return Vector of plugin information
     */
    std::vector<PluginInfo> list_plugins() const;
    
    /**
     * Get a specific plugin by ID
     * @param plugin_id Plugin ID
     * @return Pointer to plugin or nullptr if not found
     */
    Plugin* get_plugin(const std::string& plugin_id);
    
    /**
     * Get a plugin by ID (const version)
     */
    const Plugin* get_plugin(const std::string& plugin_id) const;
    
    // ========================================================================
    // Job Routing
    // ========================================================================
    
    /**
     * Find the best plugin to handle a job
     * @param type Job type
     * @param params Job parameters
     * @return Pointer to plugin or nullptr if none can handle
     */
    Plugin* find_plugin_for_job(JobType type, const JobParams& params);
    
    /**
     * Get all plugins that can handle a job type
     * @param type Job type
     * @return Vector of plugin pointers
     */
    std::vector<Plugin*> get_plugins_for_type(JobType type);
    
    // ========================================================================
    // Built-in Plugins
    // ========================================================================
    
    /**
     * Register a built-in plugin
     * @param plugin Plugin instance (ownership transferred)
     * @return Result indicating success or failure
     */
    Result<void> register_builtin(std::unique_ptr<Plugin> plugin);
    
    // ========================================================================
    // Status
    // ========================================================================
    
    /**
     * Check if plugin manager is initialized
     */
    bool is_initialized() const { return initialized_; }
    
    /**
     * Get plugin count
     */
    size_t plugin_count() const;
    
    /**
     * Run health checks on all plugins
     * @return Map of plugin ID to health status
     */
    std::map<std::string, bool> health_check() const;
    
private:
    /**
     * Scan directory for plugin files
     */
    std::vector<std::filesystem::path> scan_plugin_directory(
        const std::string& dir
    );
    
    /**
     * Load plugin from shared library
     */
    Result<PluginHandle> load_shared_library(const std::string& path);
    
    /**
     * Unload a plugin handle
     */
    void unload_handle(PluginHandle& handle);
    
    mutable std::mutex mutex_;
    bool initialized_ = false;
    std::string plugin_dir_;
    std::string config_path_;
    
    // Loaded plugins (by ID)
    std::map<std::string, PluginHandle> plugins_;
    
    // Built-in plugins (owned)
    std::vector<std::unique_ptr<Plugin>> builtin_plugins_;
    
    // Plugin ID to handle mapping for built-ins
    std::map<std::string, Plugin*> builtin_map_;
};

} // namespace media
