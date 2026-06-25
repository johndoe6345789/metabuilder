#pragma once
/**
 * @file validate_length.hpp
 * @brief String length validation
 */

#include <string>
#include <stdexcept>

namespace dbal::security {

/**
 * Validate string length within bounds
 * @param value String to validate
 * @param min_len Minimum length
 * @param max_len Maximum length
 * @param field_name Field name for error messages
 * @throws std::runtime_error if validation fails
 */
inline void validate_length(
    const std::string& value,
    size_t min_len,
    size_t max_len,
    const char* field_name = "value"
) {
    if (value.size() < min_len) {
        throw std::runtime_error(
            std::string(field_name) + " too short (min " + std::to_string(min_len) + ")"
        );
    }
    if (value.size() > max_len) {
        throw std::runtime_error(
            std::string(field_name) + " too long (max " + std::to_string(max_len) + ")"
        );
    }
}

} // namespace dbal::security
