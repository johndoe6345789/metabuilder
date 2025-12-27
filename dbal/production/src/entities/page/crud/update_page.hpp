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
inline Result<PageView> update(InMemoryStore& store, const std::string& id, const UpdatePageInput& input) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    PageView& page = it->second;
    std::string old_slug = page.slug;
    
    if (input.slug.has_value()) {
        if (!validation::isValidSlug(input.slug.value())) {
            return Error::validationError("Invalid slug format");
        }
        auto slug_it = store.page_slugs.find(input.slug.value());
        if (slug_it != store.page_slugs.end() && slug_it->second != id) {
            return Error::conflict("Slug already exists: " + input.slug.value());
        }
        store.page_slugs.erase(old_slug);
        store.page_slugs[input.slug.value()] = id;
        page.slug = input.slug.value();
    }
    
    if (input.title.has_value()) {
        if (input.title.value().empty() || input.title.value().length() > 200) {
            return Error::validationError("Title must be between 1 and 200 characters");
        }
        page.title = input.title.value();
    }
    
    if (input.description.has_value()) page.description = input.description.value();
    if (input.level.has_value()) {
        if (input.level.value() < 0 || input.level.value() > 5) {
            return Error::validationError("Level must be between 0 and 5");
        }
        page.level = input.level.value();
    }
    if (input.layout.has_value()) page.layout = input.layout.value();
    if (input.is_active.has_value()) page.is_active = input.is_active.value();
    
    page.updated_at = std::chrono::system_clock::now();
    return Result<PageView>(page);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
