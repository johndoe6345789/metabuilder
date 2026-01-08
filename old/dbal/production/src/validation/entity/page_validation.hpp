/**
 * @file page_validation.hpp
 * @brief Validation functions for PageConfig entity
 */
#ifndef DBAL_PAGE_VALIDATION_HPP
#define DBAL_PAGE_VALIDATION_HPP

#include <string>
#include <regex>

namespace dbal {
namespace validation {

/**
 * Validate path format (non-empty, max length 255)
 */
inline bool isValidPath(const std::string& path) {
    if (path.empty() || path.length() > 255) return false;
    return true;
}

} // namespace validation
} // namespace dbal

#endif
