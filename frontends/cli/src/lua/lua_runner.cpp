#include "lua_runner.h"

#define SOL_ALL_SAFETIES_ON 1
#include <sol/sol.hpp>
#include <nlohmann/json.hpp>

#include <fstream>
#include <iostream>
#include <sstream>

namespace lua {

using json = nlohmann::json;

struct LuaRunner::Impl {
    sol::state lua;
    sol::table current_module;
};

LuaRunner::LuaRunner(const fs::path& scripts_base)
    : impl_(std::make_unique<Impl>())
    , scripts_base_(scripts_base) {
    setup_sandbox();
}

LuaRunner::~LuaRunner() = default;

void LuaRunner::setup_sandbox() {
    // Open only safe libraries
    impl_->lua.open_libraries(
        sol::lib::base,
        sol::lib::string,
        sol::lib::table,
        sol::lib::math,
        sol::lib::utf8
    );

    // Remove dangerous functions from base
    impl_->lua["dofile"] = sol::lua_nil;
    impl_->lua["loadfile"] = sol::lua_nil;
    
    // Custom print that captures output
    impl_->lua.set_function("print", [](sol::variadic_args args) {
        for (auto arg : args) {
            std::cout << arg.as<std::string>();
            std::cout << "\t";
        }
        std::cout << "\n";
    });
}

fs::path LuaRunner::find_module_path(const std::string& package_id, const std::string& module_name) {
    // Try: packages/{package_id}/seed/scripts/{module_name}/init.lua
    auto path1 = scripts_base_ / package_id / "seed" / "scripts" / module_name / "init.lua";
    if (fs::exists(path1)) return path1;

    // Try: packages/{package_id}/seed/scripts/{module_name}.lua
    auto path2 = scripts_base_ / package_id / "seed" / "scripts" / (module_name + ".lua");
    if (fs::exists(path2)) return path2;

    // Try: {package_id}/seed/scripts/{module_name}/init.lua (if scripts_base includes packages/)
    auto path3 = scripts_base_ / "packages" / package_id / "seed" / "scripts" / module_name / "init.lua";
    if (fs::exists(path3)) return path3;

    return {};
}

bool LuaRunner::load_module(const std::string& package_id, const std::string& module_name) {
    auto module_path = find_module_path(package_id, module_name);
    
    if (module_path.empty()) {
        last_error_ = "Module not found: " + package_id + "/" + module_name;
        return false;
    }

    // Set up package.path to include the scripts directory
    auto scripts_dir = module_path.parent_path();
    if (module_path.filename() == "init.lua") {
        scripts_dir = scripts_dir.parent_path();
    }

    std::string package_path = impl_->lua["package"]["path"].get<std::string>();
    package_path += ";" + scripts_dir.string() + "/?.lua";
    package_path += ";" + scripts_dir.string() + "/?/init.lua";
    impl_->lua["package"]["path"] = package_path;

    try {
        auto result = impl_->lua.safe_script_file(module_path.string());
        if (!result.valid()) {
            sol::error err = result;
            last_error_ = err.what();
            return false;
        }

        impl_->current_module = result.get<sol::table>();
        module_loaded_ = true;
        return true;
    } catch (const std::exception& e) {
        last_error_ = e.what();
        return false;
    }
}

namespace {

// Convert LuaConfig to sol::table
sol::table config_to_lua(sol::state& lua, const LuaConfig& config) {
    sol::table tbl = lua.create_table();
    
    for (const auto& [key, value] : config) {
        std::visit([&](auto&& v) {
            using T = std::decay_t<decltype(v)>;
            if constexpr (std::is_same_v<T, std::nullptr_t>) {
                tbl[key] = sol::lua_nil;
            } else if constexpr (std::is_same_v<T, std::vector<std::string>>) {
                sol::table arr = lua.create_table();
                int i = 1;
                for (const auto& s : v) {
                    arr[i++] = s;
                }
                tbl[key] = arr;
            } else if constexpr (std::is_same_v<T, std::unordered_map<std::string, std::string>>) {
                sol::table map = lua.create_table();
                for (const auto& [k, val] : v) {
                    map[k] = val;
                }
                tbl[key] = map;
            } else {
                tbl[key] = v;
            }
        }, value);
    }
    
    return tbl;
}

} // namespace

RunResult LuaRunner::call(const std::string& func_name, const LuaConfig& config) {
    RunResult result;
    
    if (!module_loaded_) {
        result.error = "No module loaded";
        return result;
    }

    sol::function func = impl_->current_module[func_name];
    if (!func.valid()) {
        result.error = "Function not found: " + func_name;
        return result;
    }

    try {
        auto lua_config = config_to_lua(impl_->lua, config);
        sol::protected_function_result call_result = func(lua_config);
        
        if (!call_result.valid()) {
            sol::error err = call_result;
            result.error = err.what();
            return result;
        }

        result.success = true;
        
        // Try to extract output/files from result
        if (call_result.get_type() == sol::type::table) {
            sol::table tbl = call_result;
            
            if (tbl["success"].valid()) {
                result.success = tbl["success"].get<bool>();
            }
            if (tbl["output"].valid()) {
                result.output = tbl["output"].get<std::string>();
            }
            if (tbl["error"].valid()) {
                result.error = tbl["error"].get<std::string>();
            }
            if (tbl["files"].valid()) {
                sol::table files = tbl["files"];
                for (auto& pair : files) {
                    sol::table file = pair.second;
                    GeneratedFile gf;
                    gf.path = file["path"].get<std::string>();
                    gf.content = file["content"].get<std::string>();
                    result.files.push_back(std::move(gf));
                }
            }
        }
        
        return result;
    } catch (const std::exception& e) {
        result.error = e.what();
        return result;
    }
}

RunResult LuaRunner::call(const std::string& func_name) {
    return call(func_name, {});
}

ValidationResult LuaRunner::validate(const std::string& func_name, const LuaConfig& config) {
    ValidationResult result;
    
    if (!module_loaded_) {
        result.errors.push_back("No module loaded");
        return result;
    }

    sol::function func = impl_->current_module[func_name];
    if (!func.valid()) {
        result.errors.push_back("Function not found: " + func_name);
        return result;
    }

    try {
        auto lua_config = config_to_lua(impl_->lua, config);
        sol::protected_function_result call_result = func(lua_config);
        
        if (!call_result.valid()) {
            sol::error err = call_result;
            result.errors.push_back(err.what());
            return result;
        }

        sol::table tbl = call_result;
        result.valid = tbl["valid"].get<bool>();
        
        if (tbl["errors"].valid()) {
            sol::table errs = tbl["errors"];
            for (auto& pair : errs) {
                result.errors.push_back(pair.second.as<std::string>());
            }
        }
        
        return result;
    } catch (const std::exception& e) {
        result.errors.push_back(e.what());
        return result;
    }
}

std::vector<std::string> LuaRunner::get_list(const std::string& func_name) {
    std::vector<std::string> result;
    
    if (!module_loaded_) return result;

    sol::function func = impl_->current_module[func_name];
    if (!func.valid()) return result;

    try {
        sol::protected_function_result call_result = func();
        if (!call_result.valid()) return result;

        sol::table tbl = call_result;
        for (auto& pair : tbl) {
            result.push_back(pair.second.as<std::string>());
        }
    } catch (...) {}
    
    return result;
}

std::vector<GeneratedFile> LuaRunner::get_files(const std::string& func_name, const LuaConfig& config) {
    auto result = call(func_name, config);
    return std::move(result.files);
}

} // namespace lua
