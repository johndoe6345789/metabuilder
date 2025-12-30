#ifndef DBAL_SEARCH_LUA_SCRIPTS_HPP
#define DBAL_SEARCH_LUA_SCRIPTS_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <cctype>
#include <iterator>
#include <optional>
#include <string>
#include <vector>

namespace dbal {
namespace entities {
namespace lua_script {

namespace {

inline std::string toLower(const std::string& value) {
    std::string lowered;
    lowered.reserve(value.size());
    std::transform(value.begin(), value.end(), std::back_inserter(lowered), [](unsigned char c) {
        return static_cast<char>(std::tolower(c));
    });
    return lowered;
}

inline bool containsInsensitive(const std::string& text, const std::string& query) {
    if (query.empty()) {
        return false;
    }
    return toLower(text).find(toLower(query)) != std::string::npos;
}

} // namespace

inline Result<std::vector<LuaScript>> search(InMemoryStore& store,
                                             const std::string& query,
                                             const std::optional<std::string>& created_by = std::nullopt,
                                             int limit = 20) {
    if (query.empty()) {
        return Error::validationError("search query is required");
    }

    std::vector<LuaScript> matches;
    for (const auto& [id, script] : store.lua_scripts) {
        (void)id;
        if (created_by.has_value() && script.created_by != created_by.value()) {
            continue;
        }
        if (containsInsensitive(script.name, query) || containsInsensitive(script.code, query)) {
            matches.push_back(script);
        }
    }

    std::sort(matches.begin(), matches.end(), [](const LuaScript& a, const LuaScript& b) {
        return a.name < b.name;
    });

    if (limit > 0 && static_cast<int>(matches.size()) > limit) {
        matches.resize(limit);
    }

    return Result<std::vector<LuaScript>>(matches);
}

} // namespace lua_script
} // namespace entities
} // namespace dbal

#endif
