#ifndef DBAL_SEARCH_PAGES_HPP
#define DBAL_SEARCH_PAGES_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <cctype>
#include <iterator>
#include <string>
#include <vector>

namespace dbal {
namespace entities {
namespace page {

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
    return toLower(text).find(toLower(query)) != std::string::npos;
}

} // namespace

inline Result<std::vector<PageView>> search(InMemoryStore& store, const std::string& query, int limit = 20) {
    if (query.empty()) {
        return Error::validationError("search query is required");
    }

    std::vector<PageView> matches;
    for (const auto& [id, page] : store.pages) {
        (void)id;
        if (containsInsensitive(page.slug, query) || containsInsensitive(page.title, query)) {
            matches.push_back(page);
        }
    }

    std::sort(matches.begin(), matches.end(), [](const PageView& a, const PageView& b) {
        return a.slug < b.slug;
    });

    if (limit > 0 && static_cast<int>(matches.size()) > limit) {
        matches.resize(limit);
    }

    return Result<std::vector<PageView>>(matches);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
