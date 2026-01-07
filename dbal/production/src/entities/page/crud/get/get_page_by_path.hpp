/**
 * @file get_page_by_path.hpp
 * @brief Get page by path operation
 */
#ifndef DBAL_GET_PAGE_BY_PATH_HPP
#define DBAL_GET_PAGE_BY_PATH_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../../store/in_memory_store.hpp"
#include "get_page.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Get a page by path
 */
inline Result<PageConfig> getByPath(InMemoryStore& store, const std::string& path) {
    if (path.empty()) {
        return Error::validationError("Path cannot be empty");
    }

    auto it = store.page_paths.find(path);
    if (it == store.page_paths.end()) {
        return Error::notFound("Page not found with path: " + path);
    }

    return get(store, it->second);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
