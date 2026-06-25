/**
 * @file get_page.hpp
 * @brief Get page by ID operations
 */
#ifndef DBAL_GET_PAGE_HPP
#define DBAL_GET_PAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Get a page by ID
 */
inline Result<PageConfig> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    return Result<PageConfig>(it->second);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
