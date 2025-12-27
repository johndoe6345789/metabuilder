/**
 * @file page_validation.hpp
 * @brief Validation functions for PageView entity
 */
#ifndef DBAL_PAGE_VALIDATION_HPP
#define DBAL_PAGE_VALIDATION_HPP

#include <string>
#include <regex>

namespace dbal {
namespace validation {

/**
 * Validate slug format (lowercase alphanumeric with hyphens)
 */
inline bool isValidSlug(const std::string& slug) {
    if (slug.empty() || slug.length() > 100) return false;
    static const std::regex slug_pattern(R"([a-z0-9-]+)");
    return std::regex_match(slug, slug_pattern);
}

} // namespace validation
} // namespace dbal

#endif
