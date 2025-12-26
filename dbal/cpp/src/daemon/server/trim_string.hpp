/**
 * @file trim_string.hpp
 * @brief Trim whitespace from string
 */

#pragma once

#include <string>

namespace dbal {
namespace daemon {

/**
 * @brief Trim leading and trailing whitespace
 * @param str String to trim (modified in place)
 */
inline void trim_string(std::string& str) {
    while (!str.empty() && str[0] == ' ') {
        str = str.substr(1);
    }
    while (!str.empty() && str[str.length() - 1] == ' ') {
        str.pop_back();
    }
}

} // namespace daemon
} // namespace dbal
