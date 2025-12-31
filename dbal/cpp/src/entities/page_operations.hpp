/**
 * @file page_operations.hpp
 * @brief PageView entity CRUD operations
 * 
 * Single-responsibility module for PageView entity operations.
 */
#ifndef DBAL_PAGE_OPERATIONS_HPP
#define DBAL_PAGE_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "../validation/page_validation.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new page in the store
 */
inline Result<PageView> createPage(InMemoryStore& store, const CreatePageInput& input) {
    // Validation
    if (!validation::isValidSlug(input.slug)) {
        return Error::validationError("Invalid slug format (lowercase, alphanumeric, hyphens only)");
    }
    if (input.title.empty() || input.title.length() > 200) {
        return Error::validationError("Title must be between 1 and 200 characters");
    }
    if (input.level < 0 || input.level > 5) {
        return Error::validationError("Level must be between 0 and 5");
    }
    
    // Check for duplicate slug
    if (store.page_slugs.find(input.slug) != store.page_slugs.end()) {
        return Error::conflict("Page with slug already exists: " + input.slug);
    }
    
    // Create page
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

/**
 * Get a page by ID
 */
inline Result<PageView> getPage(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    return Result<PageView>(it->second);
}

/**
 * Get a page by slug
 */
inline Result<PageView> getPageBySlug(InMemoryStore& store, const std::string& slug) {
    if (slug.empty()) {
        return Error::validationError("Slug cannot be empty");
    }
    
    auto it = store.page_slugs.find(slug);
    if (it == store.page_slugs.end()) {
        return Error::notFound("Page not found with slug: " + slug);
    }
    
    return getPage(store, it->second);
}

/**
 * Update an existing page
 */
inline Result<PageView> updatePage(InMemoryStore& store, const std::string& id, const UpdatePageInput& input) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    PageView& page = it->second;
    std::string old_slug = page.slug;
    
    // Validate and update fields
    if (input.slug.has_value()) {
        if (!validation::isValidSlug(input.slug.value())) {
            return Error::validationError("Invalid slug format");
        }
        // Check for slug conflict
        auto slug_it = store.page_slugs.find(input.slug.value());
        if (slug_it != store.page_slugs.end() && slug_it->second != id) {
            return Error::conflict("Slug already exists: " + input.slug.value());
        }
        // Update slug mapping
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
    
    if (input.description.has_value()) {
        page.description = input.description.value();
    }
    
    if (input.level.has_value()) {
        if (input.level.value() < 0 || input.level.value() > 5) {
            return Error::validationError("Level must be between 0 and 5");
        }
        page.level = input.level.value();
    }
    
    if (input.layout.has_value()) {
        page.layout = input.layout.value();
    }
    
    if (input.is_active.has_value()) {
        page.is_active = input.is_active.value();
    }
    
    page.updated_at = std::chrono::system_clock::now();
    
    return Result<PageView>(page);
}

/**
 * Delete a page by ID
 */
inline Result<bool> deletePage(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto it = store.pages.find(id);
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    // Remove slug mapping
    store.page_slugs.erase(it->second.slug);
    store.pages.erase(it);
    
    return Result<bool>(true);
}

/**
 * List pages with filtering and pagination
 */
inline Result<std::vector<PageView>> listPages(InMemoryStore& store, const ListOptions& options) {
    std::vector<PageView> pages;
    
    for (const auto& [id, page] : store.pages) {
        // Apply filters
        bool matches = true;
        
        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (page.is_active != filter_active) matches = false;
        }
        
        if (options.filter.find("level") != options.filter.end()) {
            int filter_level = std::stoi(options.filter.at("level"));
            if (page.level != filter_level) matches = false;
        }
        
        if (matches) {
            pages.push_back(page);
        }
    }
    
    // Apply sorting
    if (options.sort.find("title") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.title < b.title;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.created_at < b.created_at;
        });
    }
    
    // Apply pagination
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(pages.size()));
    
    if (start < static_cast<int>(pages.size())) {
        return Result<std::vector<PageView>>(std::vector<PageView>(pages.begin() + start, pages.begin() + end));
    }
    
    return Result<std::vector<PageView>>(std::vector<PageView>());
}

} // namespace entities
} // namespace dbal

#endif
