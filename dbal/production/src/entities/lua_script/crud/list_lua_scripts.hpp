/**
 * @file list_lua_scripts.hpp
 * @brief List Lua scripts with filtering and pagination
 */
#ifndef DBAL_LIST_LUA_SCRIPTS_HPP
#define DBAL_LIST_LUA_SCRIPTS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace lua_script {

/**
 * List Lua scripts with filtering and pagination
 */
inline Result<std::vector<LuaScript>> list(InMemoryStore& store, const ListOptions& options) {
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

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
