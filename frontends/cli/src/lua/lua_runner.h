#pragma once

#include <filesystem>
#include <functional>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

namespace fs = std::filesystem;

namespace lua {

/**
 * Lua value variant for passing data to/from Lua
 */
using LuaValue = std::variant<
    std::nullptr_t,
    bool,
    int64_t,
    double,
    std::string,
    std::vector<std::string>,
    std::unordered_map<std::string, std::string>
>;

/**
 * Configuration map for Lua function calls
 */
using LuaConfig = std::unordered_map<std::string, LuaValue>;

/**
 * Generated file from Lua script
 */
struct GeneratedFile {
    std::string path;
    std::string content;
};

/**
 * Validation result from Lua
 */
struct ValidationResult {
    bool valid = false;
    std::vector<std::string> errors;
};

/**
 * Result from running a Lua script
 */
struct RunResult {
    bool success = false;
    std::string output;
    std::string error;
    std::vector<GeneratedFile> files;
};

/**
 * Sandboxed Lua script runner
 * 
 * Executes Lua scripts from MetaBuilder packages in a secure sandbox
 * that prevents access to os, io, debug, and other dangerous modules.
 */
class LuaRunner {
public:
    /**
     * Create runner with base scripts path
     * @param scripts_base Base path to search for scripts (e.g., packages/)
     */
    explicit LuaRunner(const fs::path& scripts_base);
    ~LuaRunner();

    // Non-copyable
    LuaRunner(const LuaRunner&) = delete;
    LuaRunner& operator=(const LuaRunner&) = delete;

    /**
     * Load a module from a package
     * @param package_id Package containing the module
     * @param module_name Module name (e.g., "package_template")
     * @return true if loaded successfully
     */
    bool load_module(const std::string& package_id, const std::string& module_name);

    /**
     * Call a Lua function with config
     * @param func_name Function name (e.g., "generate")
     * @param config Configuration to pass
     * @return Result of the call
     */
    RunResult call(const std::string& func_name, const LuaConfig& config);

    /**
     * Call a Lua function without arguments
     */
    RunResult call(const std::string& func_name);

    /**
     * Get validation result from Lua
     */
    ValidationResult validate(const std::string& func_name, const LuaConfig& config);

    /**
     * Get list of strings from Lua function
     */
    std::vector<std::string> get_list(const std::string& func_name);

    /**
     * Get generated files from Lua function
     */
    std::vector<GeneratedFile> get_files(const std::string& func_name, const LuaConfig& config);

    /**
     * Get last error message
     */
    const std::string& last_error() const { return last_error_; }

    /**
     * Check if a module is loaded
     */
    bool is_module_loaded() const { return module_loaded_; }

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
    
    fs::path scripts_base_;
    std::string last_error_;
    bool module_loaded_ = false;

    void setup_sandbox();
    fs::path find_module_path(const std::string& package_id, const std::string& module_name);
};

} // namespace lua
