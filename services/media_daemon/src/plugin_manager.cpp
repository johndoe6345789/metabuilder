#include "media/plugin_manager.hpp"
#include "media/plugin.hpp"
#include <iostream>
#include <algorithm>
#include <stdexcept>

#ifdef _WIN32
    #include <windows.h>
#else
    #include <dlfcn.h>
#endif

namespace media {

PluginManager::PluginManager() = default;

PluginManager::~PluginManager() {
    shutdown();
}

// ============================================================================
// Initialization
// ============================================================================

Result<void> PluginManager::initialize(
    const std::string& plugin_dir,
    const std::string& config_path
) {
    std::lock_guard<std::mutex> lock(mutex_);

    if (initialized_) {
        return Result<void>::ok();
    }

    plugin_dir_ = plugin_dir;
    config_path_ = config_path;

    std::cout << "[PluginManager] Initializing, plugin_dir=" << plugin_dir << std::endl;

    // Scan directory and attempt to load plugins
    if (!plugin_dir.empty()) {
        auto paths = scan_plugin_directory(plugin_dir);
        for (const auto& path : paths) {
            auto result = load_shared_library(path.string());
            if (result.is_error()) {
                std::cerr << "[PluginManager] Failed to load plugin " << path
                          << ": " << result.error_message() << std::endl;
            } else {
                auto handle = std::move(result.value());
                if (handle.instance) {
                    std::cout << "[PluginManager] Loaded plugin: "
                              << handle.instance->info().id << std::endl;
                    std::string id = handle.instance->info().id;
                    plugins_[id] = std::move(handle);
                }
            }
        }
    }

    initialized_ = true;
    std::cout << "[PluginManager] Initialized with "
              << (plugins_.size() + builtin_plugins_.size())
              << " plugin(s)" << std::endl;
    return Result<void>::ok();
}

void PluginManager::shutdown() {
    std::lock_guard<std::mutex> lock(mutex_);

    // Shutdown all dynamic plugins
    for (auto& [id, handle] : plugins_) {
        if (handle.instance && handle.is_loaded) {
            handle.instance->shutdown();
            unload_handle(handle);
        }
    }
    plugins_.clear();

    // Shutdown built-in plugins
    for (auto& plugin : builtin_plugins_) {
        if (plugin) {
            plugin->shutdown();
        }
    }
    builtin_plugins_.clear();
    builtin_map_.clear();

    initialized_ = false;
    std::cout << "[PluginManager] Shutdown complete" << std::endl;
}

// ============================================================================
// Plugin Management
// ============================================================================

Result<PluginInfo> PluginManager::load_plugin(const std::string& path) {
    std::lock_guard<std::mutex> lock(mutex_);

    auto result = load_shared_library(path);
    if (result.is_error()) {
        return Result<PluginInfo>::error(result.error_code(), result.error_message());
    }

    auto handle = std::move(result.value());
    if (!handle.instance) {
        return Result<PluginInfo>::error(
            ErrorCode::PLUGIN_ERROR,
            "Plugin instance is null after loading"
        );
    }

    PluginInfo info = handle.instance->info();

    // Initialize plugin with empty config path
    auto init_result = handle.instance->initialize("");
    if (init_result.is_error()) {
        unload_handle(handle);
        return Result<PluginInfo>::error(
            init_result.error_code(),
            "Plugin initialization failed: " + init_result.error_message()
        );
    }

    std::string id = info.id;
    plugins_[id] = std::move(handle);

    std::cout << "[PluginManager] Loaded plugin: " << id << std::endl;
    return Result<PluginInfo>::ok(info);
}

Result<void> PluginManager::unload_plugin(const std::string& plugin_id) {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = plugins_.find(plugin_id);
    if (it == plugins_.end()) {
        return Result<void>::error(ErrorCode::NOT_FOUND, "Plugin not found: " + plugin_id);
    }

    auto& handle = it->second;
    if (handle.instance) {
        handle.instance->shutdown();
    }
    unload_handle(handle);
    plugins_.erase(it);

    std::cout << "[PluginManager] Unloaded plugin: " << plugin_id << std::endl;
    return Result<void>::ok();
}

Result<PluginInfo> PluginManager::reload_plugin(const std::string& plugin_id) {
    std::string path;

    {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = plugins_.find(plugin_id);
        if (it == plugins_.end()) {
            return Result<PluginInfo>::error(
                ErrorCode::NOT_FOUND,
                "Plugin not found: " + plugin_id
            );
        }
        path = it->second.path;
        if (it->second.instance) {
            it->second.instance->shutdown();
        }
        unload_handle(it->second);
        plugins_.erase(it);
    }

    return load_plugin(path);
}

std::vector<PluginInfo> PluginManager::list_plugins() const {
    std::lock_guard<std::mutex> lock(mutex_);

    std::vector<PluginInfo> result;

    for (const auto& [id, handle] : plugins_) {
        if (handle.instance) {
            result.push_back(handle.instance->info());
        }
    }

    for (const auto& plugin : builtin_plugins_) {
        if (plugin) {
            result.push_back(plugin->info());
        }
    }

    return result;
}

Plugin* PluginManager::get_plugin(const std::string& plugin_id) {
    std::lock_guard<std::mutex> lock(mutex_);

    // Check dynamic plugins
    auto it = plugins_.find(plugin_id);
    if (it != plugins_.end()) {
        return it->second.instance;
    }

    // Check built-in plugins
    auto bit = builtin_map_.find(plugin_id);
    if (bit != builtin_map_.end()) {
        return bit->second;
    }

    return nullptr;
}

const Plugin* PluginManager::get_plugin(const std::string& plugin_id) const {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = plugins_.find(plugin_id);
    if (it != plugins_.end()) {
        return it->second.instance;
    }

    auto bit = builtin_map_.find(plugin_id);
    if (bit != builtin_map_.end()) {
        return bit->second;
    }

    return nullptr;
}

// ============================================================================
// Job Routing
// ============================================================================

Plugin* PluginManager::find_plugin_for_job(JobType type, const JobParams& params) {
    std::lock_guard<std::mutex> lock(mutex_);

    // Check dynamic plugins first
    for (auto& [id, handle] : plugins_) {
        if (handle.instance && handle.instance->can_handle(type, params)) {
            return handle.instance;
        }
    }

    // Check built-in plugins
    for (auto& plugin : builtin_plugins_) {
        if (plugin && plugin->can_handle(type, params)) {
            return plugin.get();
        }
    }

    return nullptr;
}

std::vector<Plugin*> PluginManager::get_plugins_for_type(JobType type) {
    std::lock_guard<std::mutex> lock(mutex_);

    std::vector<Plugin*> result;
    // Construct empty params to check type compatibility
    JobParams empty_params = std::map<std::string, std::string>{};

    for (auto& [id, handle] : plugins_) {
        if (handle.instance && handle.instance->can_handle(type, empty_params)) {
            result.push_back(handle.instance);
        }
    }

    for (auto& plugin : builtin_plugins_) {
        if (plugin && plugin->can_handle(type, empty_params)) {
            result.push_back(plugin.get());
        }
    }

    return result;
}

// ============================================================================
// Built-in Plugins
// ============================================================================

Result<void> PluginManager::register_builtin(std::unique_ptr<Plugin> plugin) {
    std::lock_guard<std::mutex> lock(mutex_);

    if (!plugin) {
        return Result<void>::error(ErrorCode::VALIDATION_ERROR, "Plugin is null");
    }

    std::string id = plugin->info().id;
    Plugin* raw = plugin.get();

    builtin_plugins_.push_back(std::move(plugin));
    builtin_map_[id] = raw;

    std::cout << "[PluginManager] Registered built-in plugin: " << id << std::endl;
    return Result<void>::ok();
}

// ============================================================================
// Status
// ============================================================================

size_t PluginManager::plugin_count() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return plugins_.size() + builtin_plugins_.size();
}

std::map<std::string, bool> PluginManager::health_check() const {
    std::lock_guard<std::mutex> lock(mutex_);

    std::map<std::string, bool> result;

    for (const auto& [id, handle] : plugins_) {
        if (handle.instance) {
            result[id] = handle.instance->is_healthy();
        }
    }

    for (const auto& plugin : builtin_plugins_) {
        if (plugin) {
            result[plugin->info().id] = plugin->is_healthy();
        }
    }

    return result;
}

// ============================================================================
// Private Methods
// ============================================================================

std::vector<std::filesystem::path> PluginManager::scan_plugin_directory(
    const std::string& dir
) {
    std::vector<std::filesystem::path> paths;

    if (!std::filesystem::exists(dir) || !std::filesystem::is_directory(dir)) {
        return paths;
    }

    for (const auto& entry : std::filesystem::directory_iterator(dir)) {
        if (!entry.is_regular_file()) continue;

        const auto& path = entry.path();
        const std::string ext = path.extension().string();

#ifdef _WIN32
        if (ext == ".dll") paths.push_back(path);
#elif __APPLE__
        if (ext == ".dylib" || ext == ".so") paths.push_back(path);
#else
        if (ext == ".so") paths.push_back(path);
#endif
    }

    return paths;
}

Result<PluginHandle> PluginManager::load_shared_library(const std::string& path) {
    PluginHandle handle;
    handle.path = path;

#ifdef _WIN32
    handle.library_handle = LoadLibraryA(path.c_str());
    if (!handle.library_handle) {
        DWORD err = GetLastError();
        return Result<PluginHandle>::error(
            ErrorCode::PLUGIN_ERROR,
            "Failed to load library " + path + " (error " + std::to_string(err) + ")"
        );
    }

    handle.create_func = (CreatePluginFunc)GetProcAddress(
        (HMODULE)handle.library_handle, "create_plugin");
    handle.destroy_func = (DestroyPluginFunc)GetProcAddress(
        (HMODULE)handle.library_handle, "destroy_plugin");
    handle.version_func = (PluginApiVersionFunc)GetProcAddress(
        (HMODULE)handle.library_handle, "plugin_api_version");
#else
    handle.library_handle = dlopen(path.c_str(), RTLD_NOW | RTLD_LOCAL);
    if (!handle.library_handle) {
        return Result<PluginHandle>::error(
            ErrorCode::PLUGIN_ERROR,
            "Failed to load library " + path + ": " + std::string(dlerror())
        );
    }

    handle.create_func = (CreatePluginFunc)dlsym(handle.library_handle, "create_plugin");
    handle.destroy_func = (DestroyPluginFunc)dlsym(handle.library_handle, "destroy_plugin");
    handle.version_func = (PluginApiVersionFunc)dlsym(handle.library_handle, "plugin_api_version");
#endif

    if (!handle.create_func || !handle.destroy_func || !handle.version_func) {
        unload_handle(handle);
        return Result<PluginHandle>::error(
            ErrorCode::PLUGIN_ERROR,
            "Plugin " + path + " missing required exports (create_plugin/destroy_plugin/plugin_api_version)"
        );
    }

    // Check API version compatibility
    const char* version = handle.version_func();
    if (std::string(version) != PLUGIN_API_VERSION) {
        unload_handle(handle);
        return Result<PluginHandle>::error(
            ErrorCode::PLUGIN_ERROR,
            "Plugin API version mismatch: expected " + std::string(PLUGIN_API_VERSION)
                + ", got " + std::string(version)
        );
    }

    // Create plugin instance
    handle.instance = handle.create_func();
    if (!handle.instance) {
        unload_handle(handle);
        return Result<PluginHandle>::error(
            ErrorCode::PLUGIN_ERROR,
            "Plugin create_plugin() returned null"
        );
    }

    handle.is_loaded = true;
    return Result<PluginHandle>::ok(std::move(handle));
}

void PluginManager::unload_handle(PluginHandle& handle) {
    if (handle.instance && handle.destroy_func) {
        handle.destroy_func(handle.instance);
        handle.instance = nullptr;
    }

    if (handle.library_handle) {
#ifdef _WIN32
        FreeLibrary((HMODULE)handle.library_handle);
#else
        dlclose(handle.library_handle);
#endif
        handle.library_handle = nullptr;
    }

    handle.is_loaded = false;
}

} // namespace media
