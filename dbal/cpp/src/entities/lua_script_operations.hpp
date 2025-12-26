/**
 * @file lua_script_operations.hpp
 * @brief LuaScript entity CRUD operations
 * 
 * Single-responsibility module for LuaScript entity operations.
 */
#ifndef DBAL_LUA_SCRIPT_OPERATIONS_HPP
#define DBAL_LUA_SCRIPT_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "../validation/lua_script_validation.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new Lua script in the store
 */
inline Result<LuaScript> createLuaScript(InMemoryStore& store, const CreateLuaScriptInput& input) {
    if (!validation::isValidLuaScriptName(input.name)) {
        return Error::validationError("Lua script name must be 1-255 characters");
    }
    if (!validation::isValidLuaScriptCode(input.code)) {
        return Error::validationError("Lua script code must be a non-empty string");
    }
    if (!validation::isValidLuaTimeout(input.timeout_ms)) {
        return Error::validationError("Timeout must be between 100 and 30000 ms");
    }
    if (input.created_by.empty()) {
        return Error::validationError("created_by is required");
    }

    for (const auto& entry : input.allowed_globals) {
        if (entry.empty()) {
            return Error::validationError("allowed_globals must contain non-empty strings");
        }
    }

    if (store.lua_script_names.find(input.name) != store.lua_script_names.end()) {
        return Error::conflict("Lua script name already exists: " + input.name);
    }

    LuaScript script;
    script.id = store.generateId("lua", ++store.lua_script_counter);
    script.name = input.name;
    script.description = input.description;
    script.code = input.code;
    script.is_sandboxed = input.is_sandboxed;
    script.allowed_globals = input.allowed_globals;
    script.timeout_ms = input.timeout_ms;
    script.created_by = input.created_by;
    script.created_at = std::chrono::system_clock::now();
    script.updated_at = script.created_at;

    store.lua_scripts[script.id] = script;
    store.lua_script_names[script.name] = script.id;

    return Result<LuaScript>(script);
}

/**
 * Get a Lua script by ID
 */
inline Result<LuaScript> getLuaScript(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    return Result<LuaScript>(it->second);
}

/**
 * Update an existing Lua script
 */
inline Result<LuaScript> updateLuaScript(InMemoryStore& store, const std::string& id, const UpdateLuaScriptInput& input) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    LuaScript& script = it->second;
    std::string old_name = script.name;

    if (input.name.has_value()) {
        if (!validation::isValidLuaScriptName(input.name.value())) {
            return Error::validationError("Lua script name must be 1-255 characters");
        }
        auto name_it = store.lua_script_names.find(input.name.value());
        if (name_it != store.lua_script_names.end() && name_it->second != id) {
            return Error::conflict("Lua script name already exists: " + input.name.value());
        }
        store.lua_script_names.erase(old_name);
        store.lua_script_names[input.name.value()] = id;
        script.name = input.name.value();
    }

    if (input.description.has_value()) {
        script.description = input.description.value();
    }

    if (input.code.has_value()) {
        if (!validation::isValidLuaScriptCode(input.code.value())) {
            return Error::validationError("Lua script code must be a non-empty string");
        }
        script.code = input.code.value();
    }

    if (input.is_sandboxed.has_value()) {
        script.is_sandboxed = input.is_sandboxed.value();
    }

    if (input.allowed_globals.has_value()) {
        for (const auto& entry : input.allowed_globals.value()) {
            if (entry.empty()) {
                return Error::validationError("allowed_globals must contain non-empty strings");
            }
        }
        script.allowed_globals = input.allowed_globals.value();
    }

    if (input.timeout_ms.has_value()) {
        if (!validation::isValidLuaTimeout(input.timeout_ms.value())) {
            return Error::validationError("Timeout must be between 100 and 30000 ms");
        }
        script.timeout_ms = input.timeout_ms.value();
    }

    if (input.created_by.has_value()) {
        if (input.created_by.value().empty()) {
            return Error::validationError("created_by is required");
        }
        script.created_by = input.created_by.value();
    }

    script.updated_at = std::chrono::system_clock::now();

    return Result<LuaScript>(script);
}

/**
 * Delete a Lua script by ID
 */
inline Result<bool> deleteLuaScript(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto it = store.lua_scripts.find(id);
    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    store.lua_script_names.erase(it->second.name);
    store.lua_scripts.erase(it);

    return Result<bool>(true);
}

/**
 * List Lua scripts with filtering and pagination
 */
inline Result<std::vector<LuaScript>> listLuaScripts(InMemoryStore& store, const ListOptions& options) {
    std::vector<LuaScript> scripts;

    for (const auto& [id, script] : store.lua_scripts) {
        bool matches = true;

        if (options.filter.find("created_by") != options.filter.end()) {
            if (script.created_by != options.filter.at("created_by")) matches = false;
        }

        if (options.filter.find("is_sandboxed") != options.filter.end()) {
            bool filter_sandboxed = options.filter.at("is_sandboxed") == "true";
            if (script.is_sandboxed != filter_sandboxed) matches = false;
        }

        if (matches) {
            scripts.push_back(script);
        }
    }

    if (options.sort.find("name") != options.sort.end()) {
        std::sort(scripts.begin(), scripts.end(), [](const LuaScript& a, const LuaScript& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(scripts.begin(), scripts.end(), [](const LuaScript& a, const LuaScript& b) {
            return a.created_at < b.created_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(scripts.size()));

    if (start < static_cast<int>(scripts.size())) {
        return Result<std::vector<LuaScript>>(std::vector<LuaScript>(scripts.begin() + start, scripts.begin() + end));
    }

    return Result<std::vector<LuaScript>>(std::vector<LuaScript>());
}

} // namespace entities
} // namespace dbal

#endif
