/**
 * @file to_lowercase.hpp
 * @brief Convert string to lowercase
 */

#pragma once

#include <string>
#include <algorithm>
#include <cctype>

namespace dbal {
namespace daemon {

/**
 * @brief Convert string to lowercase
 * @param str String to convert
 * @return Lowercase string
 */
inline std::string to_lowercase(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::tolower);
    return result;
}

} // namespace daemon
} // namespace dbal
