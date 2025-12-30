/**
 * Lua Runner - sol2-based Lua script executor
 * 
 * Provides a sandboxed Lua environment for running package template scripts.
 */

#pragma once

#include <string>
#include <vector>
#include <filesystem>
#include <memory>
#include <stdexcept>

#define SOL_ALL_SAFETIES_ON 1
#include <sol/sol.hpp>
#include <nlohmann/json.hpp>

namespace fs = std::filesystem;
using json = nlohmann::json;

namespace tools {

/**
 * Configuration object to pass to Lua functions
 */
class LuaConfig {
public:
    json data;

    void set(const std::string& key, const std::string& value) {
        if (!value.empty()) {
            data[key] = value;
        }
    }

    void set(const std::string& key, int value) {
        data[key] = value;
    }

    void set(const std::string& key, bool value) {
        data[key] = value;
    }

    void set_list(const std::string& key, const std::vector<std::string>& values) {
        if (!values.empty()) {
            data[key] = values;
        } else {
            data[key] = json::array();
        }
    }

    static LuaConfig from_json(const std::string& json_str) {
        LuaConfig config;
        config.data = json::parse(json_str);
        return config;
    }

    sol::table to_lua_table(sol::state& lua) const {
        return json_to_lua(lua, data);
    }

private:
    sol::object json_to_lua(sol::state& lua, const json& j) const {
        if (j.is_null()) {
            return sol::nil;
        } else if (j.is_boolean()) {
            return sol::make_object(lua, j.get<bool>());
        } else if (j.is_number_integer()) {
            return sol::make_object(lua, j.get<int64_t>());
        } else if (j.is_number_float()) {
            return sol::make_object(lua, j.get<double>());
        } else if (j.is_string()) {
            return sol::make_object(lua, j.get<std::string>());
        } else if (j.is_array()) {
            sol::table arr = lua.create_table();
            int idx = 1;
            for (const auto& elem : j) {
                arr[idx++] = json_to_lua(lua, elem);
            }
            return arr;
        } else if (j.is_object()) {
            sol::table obj = lua.create_table();
            for (auto& [key, val] : j.items()) {
                obj[key] = json_to_lua(lua, val);
            }
            return obj;
        }
        return sol::nil;
    }
};

/**
 * Generated file structure
 */
struct GeneratedFile {
    std::string path;
    std::string content;
};

using GeneratedFiles = std::vector<GeneratedFile>;

/**
 * Validation result from Lua
 */
struct ValidationResult {
    bool valid = false;
    std::vector<std::string> errors;
};

/**
 * Lua script runner with sandboxed environment
 */
class LuaRunner {
public:
    explicit LuaRunner(const fs::path& scripts_path) 
        : scripts_path_(scripts_path) {
        initialize();
    }

    /**
     * Load a Lua module by name
     */
    bool load_module(const std::string& module_name) {
        auto module_path = scripts_path_ / module_name / "init.lua";
        if (!fs::exists(module_path)) {
            // Try direct file
            module_path = scripts_path_ / (module_name + ".lua");
        }
        
        if (!fs::exists(module_path)) {
            return false;
        }

        try {
            auto result = lua_.safe_script_file(module_path.string());
            if (!result.valid()) {
                sol::error err = result;
                last_error_ = err.what();
                return false;
            }
            
            // Store the module
            loaded_modules_[module_name] = result.get<sol::table>();
            return true;
        } catch (const std::exception& e) {
            last_error_ = e.what();
            return false;
        }
    }

    /**
     * Call a Lua function with config, returning typed result
     */
    template<typename T>
    T call(const std::string& func_path, const LuaConfig& config) {
        return call_impl<T>(func_path, config.to_lua_table(lua_));
    }

    /**
     * Call a Lua function without arguments
     */
    template<typename T>
    T call(const std::string& func_path) {
        return call_impl<T>(func_path, sol::nil);
    }

    const std::string& last_error() const { return last_error_; }

private:
    sol::state lua_;
    fs::path scripts_path_;
    std::string last_error_;
    std::unordered_map<std::string, sol::table> loaded_modules_;

    void initialize() {
        // Open safe libraries only (no os, io, debug)
        lua_.open_libraries(
            sol::lib::base,
            sol::lib::string,
            sol::lib::table,
            sol::lib::math,
            sol::lib::utf8
        );

        // Set up package path
        std::string package_path = lua_["package"]["path"];
        package_path += ";" + scripts_path_.string() + "/?.lua";
        package_path += ";" + scripts_path_.string() + "/?/init.lua";
        lua_["package"]["path"] = package_path;

        // Add custom require that respects sandbox
        setup_sandboxed_require();
    }

    void setup_sandboxed_require() {
        // Override require to prevent loading unsafe modules
        lua_.set_function("safe_require", [this](const std::string& name) -> sol::object {
            // Block dangerous modules
            static const std::vector<std::string> blocked = {
                "os", "io", "debug", "ffi", "package.loadlib"
            };
            
            for (const auto& b : blocked) {
                if (name == b || name.find(b + ".") == 0) {
                    throw std::runtime_error("Module '" + name + "' is not allowed in sandbox");
                }
            }

            // Check if already loaded
            if (loaded_modules_.count(name)) {
                return loaded_modules_[name];
            }

            // Try to load
            if (load_module(name)) {
                return loaded_modules_[name];
            }

            throw std::runtime_error("Module '" + name + "' not found");
        });

        // Replace require
        lua_.script(R"(
            local original_require = require
            require = function(name)
                local ok, result = pcall(safe_require, name)
                if ok then return result end
                return original_require(name)
            end
        )");
    }

    template<typename T>
    T call_impl(const std::string& func_path, sol::object arg) {
        // Parse "module.function" path
        auto dot_pos = func_path.find('.');
        if (dot_pos == std::string::npos) {
            throw std::runtime_error("Invalid function path: " + func_path);
        }

        auto module_name = func_path.substr(0, dot_pos);
        auto func_name = func_path.substr(dot_pos + 1);

        if (!loaded_modules_.count(module_name)) {
            throw std::runtime_error("Module not loaded: " + module_name);
        }

        auto& module = loaded_modules_[module_name];
        sol::function func = module[func_name];
        
        if (!func.valid()) {
            throw std::runtime_error("Function not found: " + func_path);
        }

        sol::protected_function_result result;
        if (arg == sol::nil) {
            result = func();
        } else {
            result = func(arg);
        }

        if (!result.valid()) {
            sol::error err = result;
            throw std::runtime_error(err.what());
        }

        return convert_result<T>(result);
    }

    // Specializations for different return types
    template<typename T>
    T convert_result(sol::protected_function_result& result);
};

// Specialization for GeneratedFiles
template<>
inline GeneratedFiles LuaRunner::convert_result<GeneratedFiles>(sol::protected_function_result& result) {
    GeneratedFiles files;
    sol::table lua_files = result;
    
    for (auto& pair : lua_files) {
        sol::table file_table = pair.second;
        GeneratedFile file;
        file.path = file_table["path"].get<std::string>();
        file.content = file_table["content"].get<std::string>();
        files.push_back(std::move(file));
    }
    
    return files;
}

// Specialization for ValidationResult
template<>
inline ValidationResult LuaRunner::convert_result<ValidationResult>(sol::protected_function_result& result) {
    ValidationResult validation;
    sol::table lua_result = result;
    
    validation.valid = lua_result["valid"].get<bool>();
    
    if (lua_result["errors"].valid()) {
        sol::table errors = lua_result["errors"];
        for (auto& pair : errors) {
            validation.errors.push_back(pair.second.as<std::string>());
        }
    }
    
    return validation;
}

// Specialization for vector<string>
template<>
inline std::vector<std::string> LuaRunner::convert_result<std::vector<std::string>>(sol::protected_function_result& result) {
    std::vector<std::string> vec;
    sol::table lua_table = result;
    
    for (auto& pair : lua_table) {
        vec.push_back(pair.second.as<std::string>());
    }
    
    return vec;
}

} // namespace tools
