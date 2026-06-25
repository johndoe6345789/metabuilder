/**
 * @file update_page.hpp
 * @brief Update page operation
 */
#ifndef DBAL_UPDATE_PAGE_HPP
#define DBAL_UPDATE_PAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/page_validation.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Update an existing page
 */
inline Result<PageConfig> update(InMemoryStore& store, const std::string& id, const UpdatePageInput& input) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    PageConfig& page = it->second;
    std::string old_path = page.path;
    
    if (input.path.has_value()) {
        if (!validation::isValidPath(input.path.value())) {
            return Error::validationError("Invalid path format");
        }
        auto path_it = store.page_paths.find(input.path.value());
        if (path_it != store.page_paths.end() && path_it->second != id) {
            return Error::conflict("Path already exists: " + input.path.value());
        }
        store.page_paths.erase(old_path);
        store.page_paths[input.path.value()] = id;
        page.path = input.path.value();
    }
    
    if (input.title.has_value()) {
        if (input.title.value().empty() || input.title.value().length() > 255) {
            return Error::validationError("Title must be between 1 and 255 characters");
        }
        page.title = input.title.value();
    }
    
    if (input.description.has_value()) page.description = input.description.value();
    if (input.icon.has_value()) page.icon = input.icon.value();
    if (input.component.has_value()) page.component = input.component.value();
    if (input.level.has_value()) {
        if (input.level.value() < 1 || input.level.value() > 6) {
            return Error::validationError("Level must be between 1 and 6");
        }
        page.level = input.level.value();
    }
    if (input.componentTree.has_value()) page.componentTree = input.componentTree.value();
    if (input.requiresAuth.has_value()) page.requiresAuth = input.requiresAuth.value();
    if (input.requiredRole.has_value()) page.requiredRole = input.requiredRole.value();
    if (input.parentPath.has_value()) page.parentPath = input.parentPath.value();
    if (input.sortOrder.has_value()) page.sortOrder = input.sortOrder.value();
    if (input.isPublished.has_value()) page.isPublished = input.isPublished.value();
    if (input.params.has_value()) page.params = input.params.value();
    if (input.meta.has_value()) page.meta = input.meta.value();
    if (input.packageId.has_value()) page.packageId = input.packageId.value();
    if (input.tenantId.has_value()) page.tenantId = input.tenantId.value();
    
    return Result<PageConfig>(page);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
