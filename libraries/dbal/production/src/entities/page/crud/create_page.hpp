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
inline Result<PageConfig> create(InMemoryStore& store, const CreatePageInput& input) {
    if (!validation::isValidPath(input.path)) {
        return Error::validationError("Invalid path format");
    }
    if (input.title.empty() || input.title.length() > 255) {
        return Error::validationError("Title must be between 1 and 255 characters");
    }
    if (input.level < 1 || input.level > 6) {
        return Error::validationError("Level must be between 1 and 6");
    }
    
    if (store.page_paths.find(input.path) != store.page_paths.end()) {
        return Error::conflict("Page with path already exists: " + input.path);
    }
    
    PageConfig page;
    page.id = store.generateId("page", ++store.page_counter);
    page.tenantId = input.tenantId;
    page.packageId = input.packageId;
    page.path = input.path;
    page.title = input.title;
    page.description = input.description;
    page.icon = input.icon;
    page.component = input.component;
    page.componentTree = input.componentTree;
    page.level = input.level;
    page.requiresAuth = input.requiresAuth;
    page.requiredRole = input.requiredRole;
    page.parentPath = input.parentPath;
    page.sortOrder = input.sortOrder;
    page.isPublished = input.isPublished;
    page.params = input.params;
    page.meta = input.meta;
    page.createdAt = std::chrono::system_clock::now();
    
    store.pages[page.id] = page;
    store.page_paths[page.path] = page.id;
    
    return Result<PageConfig>(page);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
