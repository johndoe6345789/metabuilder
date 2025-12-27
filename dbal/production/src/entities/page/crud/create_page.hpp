/**
 * @file create_page.hpp
 * @brief Create page operation
 */
#ifndef DBAL_CREATE_PAGE_HPP
#define DBAL_CREATE_PAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/page_validation.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Create a new page in the store
 */
inline Result<PageView> create(InMemoryStore& store, const CreatePageInput& input) {
    if (!validation::isValidSlug(input.slug)) {
        return Error::validationError("Invalid slug format (lowercase, alphanumeric, hyphens only)");
    }
    if (input.title.empty() || input.title.length() > 200) {
        return Error::validationError("Title must be between 1 and 200 characters");
    }
    if (input.level < 0 || input.level > 5) {
        return Error::validationError("Level must be between 0 and 5");
    }
    
    if (store.page_slugs.find(input.slug) != store.page_slugs.end()) {
        return Error::conflict("Page with slug already exists: " + input.slug);
    }
    
    PageView page;
    page.id = store.generateId("page", ++store.page_counter);
    page.slug = input.slug;
    page.title = input.title;
    page.description = input.description;
    page.level = input.level;
    page.layout = input.layout;
    page.is_active = input.is_active;
    page.created_at = std::chrono::system_clock::now();
    page.updated_at = page.created_at;
    
    store.pages[page.id] = page;
    store.page_slugs[page.slug] = page.id;
    
    return Result<PageView>(page);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
