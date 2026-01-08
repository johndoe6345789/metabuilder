/**
 * @file delete_page.hpp
 * @brief Delete page operation
 */
#ifndef DBAL_DELETE_PAGE_HPP
#define DBAL_DELETE_PAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Delete a page by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    store.page_paths.erase(it->second.path);
    store.pages.erase(it);
    
    return Result<bool>(true);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
