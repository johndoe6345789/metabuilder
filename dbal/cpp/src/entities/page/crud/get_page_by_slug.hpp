/**
 * @file get_page_by_slug.hpp
 * @brief Get page by slug operation
 */
#ifndef DBAL_GET_PAGE_BY_SLUG_HPP
#define DBAL_GET_PAGE_BY_SLUG_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "get_page.hpp"

namespace dbal {
namespace entities {
namespace page {

/**
 * Get a page by slug
 */
inline Result<PageView> getBySlug(InMemoryStore& store, const std::string& slug) {
    if (slug.empty()) {
        return Error::validationError("Slug cannot be empty");
    }

    auto it = store.page_slugs.find(slug);
    if (it == store.page_slugs.end()) {
        return Error::notFound("Page not found with slug: " + slug);
    }

    return get(store, it->second);
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
