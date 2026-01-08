#ifndef DBAL_SEARCH_COMPONENTS_HPP
#define DBAL_SEARCH_COMPONENTS_HPP

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
namespace component {

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

inline Result<std::vector<ComponentNode>> search(InMemoryStore& store,
                                                     const std::string& query,
                                                     const std::optional<std::string>& pageId = std::nullopt,
                                                     int limit = 20) {
    if (query.empty()) {
        return Error::validationError("search query is required");
    }

    std::vector<ComponentNode> matches;
    for (const auto& [id, component] : store.components) {
        (void)id;
        if (pageId.has_value() && component.pageId != pageId.value()) {
            continue;
        }
        bool matchesQuery = containsInsensitive(component.type, query);
        if (!matchesQuery) {
            matchesQuery = containsInsensitive(component.childIds, query);
        }
        if (matchesQuery) {
            matches.push_back(component);
        }
    }

    std::sort(matches.begin(), matches.end(), [](const ComponentNode& a, const ComponentNode& b) {
        if (a.type != b.type) {
            return a.type < b.type;
        }
        return a.order < b.order;
    });

    if (limit > 0 && static_cast<int>(matches.size()) > limit) {
        matches.resize(limit);
    }

    return Result<std::vector<ComponentNode>>(matches);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
