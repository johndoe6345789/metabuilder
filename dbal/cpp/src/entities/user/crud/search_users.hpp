#ifndef DBAL_SEARCH_USERS_HPP
#define DBAL_SEARCH_USERS_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <cctype>
#include <iterator>
#include <string>
#include <vector>

namespace dbal {
namespace entities {
namespace user {

namespace {

inline std::string toLower(const std::string& value) {
    std::string lowered;
    lowered.reserve(value.size());
    std::transform(value.begin(), value.end(), std::back_inserter(lowered), [](unsigned char c) {
        return static_cast<char>(std::tolower(c));
    });
    return lowered;
}

inline bool containsInsensitive(const std::string& haystack, const std::string& needle) {
    const std::string lowerHaystack = toLower(haystack);
    const std::string lowerNeedle = toLower(needle);
    return lowerHaystack.find(lowerNeedle) != std::string::npos;
}

} // namespace

inline Result<std::vector<User>> search(InMemoryStore& store, const std::string& query, int limit = 20) {
    if (query.empty()) {
        return Error::validationError("search query is required");
    }

    std::vector<User> matches;
    for (const auto& [id, user] : store.users) {
        (void)id;
        if (containsInsensitive(user.username, query) || containsInsensitive(user.email, query)) {
            matches.push_back(user);
        }
    }

    if (limit > 0 && static_cast<int>(matches.size()) > limit) {
        matches.resize(limit);
    }

    return Result<std::vector<User>>(matches);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
